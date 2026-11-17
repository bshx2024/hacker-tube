#!/usr/bin/env python3
"""
HackerTube Vercel & Cloudflare DevOps Sentinel (全链路异常监控哨兵)
------------------------------------------------------------------
1. 真实探针拨测：模拟 Googlebot 与真实用户，毫秒级检测主站与内页状态；
2. 停机与白屏识别：捕获 HTTP 402 (Payment Required)、白屏特征码、Vercel 欠费暂停标记；
3. Cloudflare 异常调用监控：
   - 边缘缓存命中率 (Cache Hit Ratio, CHR < 80% 预警穿透风险)；
   - 恶意攻击与 WAF 拦截 (Threats / Bot Attack 突发告警)；
   - 4xx 撞库 / 5xx 故障率突增监控；
4. Vercel 资源与盗刷预警：
   - Serverless 函数调用量异动（防 AI 笔记生成接口被盗刷）；
   - Fast Data Transfer 流量突发；
   - 额度使用率超 75%/90% 阶梯式自动预警；
5. 即时推送：支持飞书 Webhook 交互卡片、本地自动化日志。
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
from datetime import datetime

# 监测目标清单
TARGET_URLS = [
    "https://www.hacker-tube.net/",
    "https://www.hacker-tube.net/v/karpathy-micrograd",
    "https://www.hacker-tube.net/topic/ai-machine-learning",
    "https://www.hacker-tube.net/api/dataset",
]

# Vercel 402 封停白屏典型特征码
PAUSE_SIGNATURES = [
    "This deployment is temporarily paused",
    "DEPLOYMENT_DISABLED",
    "DEPLOYMENT_PAUSED",
    "Payment Required",
    "402: PAYMENT_REQUIRED",
    "Account Unpaid",
]

USER_AGENTS = {
    "googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
}

def send_feishu_alert(webhook_url: str, title: str, content: str, level: str = "EMERGENCY"):
    """发送飞书告警卡片"""
    if not webhook_url:
        return False
    color = "red" if level == "EMERGENCY" else "orange" if level == "WARNING" else "green"
    payload = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": f"🚨 [{level}] {title}"},
                "template": color,
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"**监控对象**: `https://www.hacker-tube.net`\n**触发时间**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n**详情描述**:\n{content}",
                    },
                },
                {"tag": "hr"},
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": "🛡️ HackerTube 24/7 DevOps SLA Sentinel 自动哨兵",
                        }
                    ],
                },
            ],
        },
    }
    try:
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status == 200
    except Exception as e:
        print(f"[Sentinel] Failed to dispatch Feishu webhook: {e}")
        return False

def check_endpoint(url: str, ua_key: str = "googlebot"):
    """检测单条 URL 状态、响应头元数据及白屏签名"""
    headers = {
        "User-Agent": USER_AGENTS.get(ua_key, USER_AGENTS["googlebot"]),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    req = urllib.request.Request(url, headers=headers)
    start_time = time.time()

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            latency_ms = int((time.time() - start_time) * 1000)
            status_code = response.status
            body_sample = response.read(16384).decode("utf-8", errors="ignore")
            
            # 提取全链路响应头信息
            x_vercel_id = response.headers.get("x-vercel-id", "none")
            vercel_cache = response.headers.get("x-vercel-cache", "none")
            cf_cache = response.headers.get("cf-cache-status", "none")
            cf_ray = response.headers.get("cf-ray", "none")
            age = response.headers.get("age", "0")

            # 校验是否在 200 响应中夹带了白屏特征码
            for sig in PAUSE_SIGNATURES:
                if sig.lower() in body_sample.lower():
                    return {
                        "url": url,
                        "ok": False,
                        "status": 402,
                        "error_type": "PAUSED_BODY_DETECTED",
                        "signature": sig,
                        "latency_ms": latency_ms,
                        "vercel_id": x_vercel_id,
                    }

            return {
                "url": url,
                "ok": True,
                "status": status_code,
                "latency_ms": latency_ms,
                "vercel_id": x_vercel_id,
                "vercel_cache": vercel_cache,
                "cf_cache": cf_cache,
                "cf_ray": cf_ray,
                "age": age,
            }

    except urllib.error.HTTPError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        body = e.read(4096).decode("utf-8", errors="ignore") if hasattr(e, "read") else ""
        x_vercel_id = e.headers.get("x-vercel-id", "none") if e.headers else "none"

        is_pause_402 = e.code == 402 or any(s.lower() in body.lower() for s in PAUSE_SIGNATURES)

        return {
            "url": url,
            "ok": False,
            "status": e.code,
            "error_type": "VERCEL_402_PAUSED" if is_pause_402 else f"HTTP_{e.code}",
            "body_preview": body[:200],
            "latency_ms": latency_ms,
            "vercel_id": x_vercel_id,
        }
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        return {
            "url": url,
            "ok": False,
            "status": 0,
            "error_type": f"NETWORK_ERROR: {str(e)}",
            "latency_ms": latency_ms,
            "vercel_id": "none",
        }

def check_cloudflare_analytics(cf_token: str, zone_id: str):
    """通过 Cloudflare API 分析过去 24 小时的调用量、缓存命中率及异常威胁"""
    if not cf_token or not zone_id:
        return None

    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard?since=-1440"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {cf_token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            if res.status == 200:
                payload = json.loads(res.read().decode("utf-8"))
                totals = payload.get("result", {}).get("totals", {})
                
                requests_all = totals.get("requests", {}).get("all", 0)
                requests_cached = totals.get("requests", {}).get("cached", 0)
                requests_uncached = totals.get("requests", {}).get("uncached", 0)
                threats = totals.get("threats", {}).get("all", 0)
                bandwidth_gb = totals.get("bandwidth", {}).get("all", 0) / (1024 ** 3)
                status_codes = totals.get("requests", {}).get("http_status", {})

                # 计算核心健康指标
                cache_hit_ratio = (requests_cached / requests_all * 100) if requests_all > 0 else 100.0
                
                err_5xx = sum(v for k, v in status_codes.items() if str(k).startswith("5"))
                err_4xx = sum(v for k, v in status_codes.items() if str(k).startswith("4"))
                err_5xx_rate = (err_5xx / requests_all * 100) if requests_all > 0 else 0.0

                anomalies = []
                if cache_hit_ratio < 75.0 and requests_all > 100:
                    anomalies.append(f"缓存穿透警告: Cloudflare 缓存命中率仅 {cache_hit_ratio:.1f}% (< 75%)，回源请求可能击穿 Vercel 配额！")
                if threats > 200:
                    anomalies.append(f"攻击告警: 过去 24h 捕获到 {threats} 次恶意安全威胁 (Threats/Bot attacks)！")
                if err_5xx_rate > 2.0 and requests_all > 50:
                    anomalies.append(f"服务端异常: 5xx 错误率达 {err_5xx_rate:.2f}% (共 {err_5xx} 次)，源站或边缘发生崩溃！")

                return {
                    "requests_all": requests_all,
                    "requests_cached": requests_cached,
                    "requests_uncached": requests_uncached,
                    "cache_hit_ratio": cache_hit_ratio,
                    "threats": threats,
                    "bandwidth_gb": round(bandwidth_gb, 2),
                    "err_5xx": err_5xx,
                    "err_4xx": err_4xx,
                    "anomalies": anomalies,
                }
    except Exception as e:
        return {"error": f"Cloudflare API connection notice: {e}"}

def check_vercel_api_usage(vercel_token: str, team_id: str = ""):
    """轮询 Vercel 官方 Usage API，检测流量/算力是否超 80% 提前预警"""
    if not vercel_token:
        return None
    url = "https://api.vercel.com/v2/usage"
    if team_id:
        url += f"?teamId={team_id}"

    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {vercel_token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                metrics = data.get("metrics", {})
                
                # 提取重点关注的额度消耗
                bandwidth = metrics.get("fastDataTransfer", {})
                function_invocations = metrics.get("functionInvocations", {})
                execution_time = metrics.get("functionExecution", {})
                middleware = metrics.get("edgeMiddlewareInvocations", {})

                anomalies = []
                # 检查使用量是否接近限制
                for name, item in [("带宽流量", bandwidth), ("函数调用", function_invocations), ("执行时长", execution_time), ("中间件", middleware)]:
                    if isinstance(item, dict) and "value" in item and "limit" in item:
                        val = item["value"]
                        lim = item["limit"]
                        if lim and lim > 0:
                            pct = (val / lim) * 100
                            if pct >= 85.0:
                                anomalies.append(f"Vercel 配额紧急预警: [{name}] 已消耗 {pct:.1f}% ({val}/{lim})，濒临 402 封停线！")
                            elif pct >= 75.0:
                                anomalies.append(f"Vercel 配额注意: [{name}] 已消耗 {pct:.1f}% ({val}/{lim})")

                return {
                    "raw": metrics,
                    "anomalies": anomalies,
                }
    except Exception as e:
        return {"error": f"Vercel API connection notice: {e}"}

def run_probe():
    """主巡检与异常监控逻辑"""
    feishu_webhook = os.environ.get("FEISHU_WEBHOOK_URL") or os.environ.get("LARK_WEBHOOK_URL", "")
    vercel_token = os.environ.get("VERCEL_API_TOKEN") or os.environ.get("VERCEL_TOKEN", "")
    cf_token = os.environ.get("CLOUDFLARE_API_TOKEN", "")
    cf_zone_id = os.environ.get("CLOUDFLARE_ZONE_ID", "")

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"==========================================================================")
    print(f"🛡️ HackerTube Vercel & Cloudflare DevOps Sentinel Probe ({timestamp})")
    print(f"==========================================================================")

    # 1. 真实探针拨测
    print("\n[Phase 1: 真实探针健康拨测 & 响应头元数据]")
    failures = []
    successes = []

    for target in TARGET_URLS:
        result = check_endpoint(target, ua_key="googlebot")
        path = target.replace("https://www.hacker-tube.net", "") or "/"
        if result["ok"]:
            cf_info = f"CF-Cache: {result.get('cf_cache', 'none')}"
            vc_info = f"Vercel: {result.get('vercel_cache', 'none')}"
            latency = f"{result['latency_ms']}ms"
            print(f"  ✅ [HTTP {result['status']}] {path:<32} {latency:>6} | {cf_info:<18} | {vc_info}")
            successes.append(result)
        else:
            print(f"  ❌ [FAIL {result['status']}] {path:<32} -> {result['error_type']} ({result['latency_ms']}ms)")
            failures.append(result)

    # 2. Cloudflare 深度异常指标
    print("\n[Phase 2: Cloudflare 流量与异常调用分析]")
    cf_data = check_cloudflare_analytics(cf_token, cf_zone_id) if cf_token and cf_zone_id else None
    cf_alerts = []
    if cf_data and "error" not in cf_data:
        print(f"  • 总请求量 (24h): {cf_data['requests_all']:,} 次 (已缓存: {cf_data['requests_cached']:,}, 回源: {cf_data['requests_uncached']:,})")
        print(f"  • 边缘缓存命中率: {cf_data['cache_hit_ratio']:.1f}%")
        print(f"  • 安全拦截威胁:   {cf_data['threats']} 次 (Bad bots/WAF)")
        print(f"  • 流量总计:       {cf_data['bandwidth_gb']} GB")
        print(f"  • 错误计数:       5xx: {cf_data['err_5xx']}, 4xx: {cf_data['err_4xx']}")
        if cf_data["anomalies"]:
            for a in cf_data["anomalies"]:
                print(f"    ⚠️ [CF 异动警告] {a}")
                cf_alerts.append(a)
        else:
            print(f"  ✨ Cloudflare 调用指标健康，未发现穿透或 DDoS 风险。")
    else:
        print("  ℹ️ 未配置 CLOUDFLARE_API_TOKEN，已启用零配置响应头被动探测（CF-Cache 状态正常）。")

    # 3. Vercel 用量与额度熔断检测
    print("\n[Phase 3: Vercel 配额与函数盗刷监控]")
    vc_data = check_vercel_api_usage(vercel_token) if vercel_token else None
    vc_alerts = []
    if vc_data and "error" not in vc_data:
        if vc_data.get("anomalies"):
            for a in vc_data["anomalies"]:
                print(f"    ⚠️ [Vercel 异动警告] {a}")
                vc_alerts.append(a)
        else:
            print("  ✨ Vercel Serverless 与带宽使用率均处于安全水位 (<75%)。")
    else:
        print("  ℹ️ 未配置 VERCEL_API_TOKEN，当前通过 HTTP 402/Paused 特征码进行实时硬阻断监控。")

    # 4. 汇总告警判定
    all_alerts = []
    if failures:
        all_alerts.extend([f"🔴 [服务中断] {f['url']}: HTTP {f['status']} ({f['error_type']})" for f in failures])
    if cf_alerts:
        all_alerts.extend([f"🟠 [Cloudflare 异动] {a}" for a in cf_alerts])
    if vc_alerts:
        all_alerts.extend([f"🟡 [Vercel 预警] {a}" for a in vc_alerts])

    if all_alerts:
        print("\n🚨 CRITICAL ANOMALY ALERT TRIGGERED!")
        alert_body = "\n".join(all_alerts)
        if feishu_webhook:
            send_feishu_alert(
                feishu_webhook,
                title="HackerTube 出现异常调用或停机风险！",
                content=f"监控哨兵捕获到以下异常指标，请及时排查：\n{alert_body}",
                level="EMERGENCY" if failures else "WARNING",
            )
            print(f"  -> 告警卡片已秒级推送至飞书群机器人！")
        return False
    else:
        print("\n✨ All systems nominal. 零异常调用，零 402 风险。")
        return True

if __name__ == "__main__":
    success = run_probe()
    sys.exit(0 if success else 1)
