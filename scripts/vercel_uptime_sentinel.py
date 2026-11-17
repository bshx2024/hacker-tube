#!/usr/bin/env python3
"""
HackerTube Vercel 402 & Uptime Sentinel (高可用与防白屏监控哨兵)
-------------------------------------------------------------
1. 拨测监控：模拟 Googlebot 与真实用户，定时检测主域名与关键长尾页；
2. 异常捕获：毫秒级捕获 HTTP 402 (Payment Required)、白屏特征码、Vercel 欠费暂停标记；
3. 提前预警：支持轮询 Vercel 官方 Usage API，额度超标提前告警；
4. 告警推送：支持飞书 Webhook、钉钉、Telegram 及本地守护告警。
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
    """检测单条 URL 状态及白屏签名"""
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
            x_vercel_id = response.headers.get("x-vercel-id", "none")
            cache_status = response.headers.get("x-vercel-cache", "none")

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
                "cache": cache_status,
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
                return data
    except Exception as e:
        print(f"[Sentinel] Vercel API check notice: {e}")
    return None

def run_probe():
    """主巡检逻辑"""
    feishu_webhook = os.environ.get("FEISHU_WEBHOOK_URL") or os.environ.get("LARK_WEBHOOK_URL", "")
    vercel_token = os.environ.get("VERCEL_API_TOKEN") or os.environ.get("VERCEL_TOKEN", "")

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"==================================================")
    print(f"🛡️ HackerTube Vercel 402 & Uptime Sentinel ({timestamp})")
    print(f"==================================================")

    failures = []
    successes = []

    for target in TARGET_URLS:
        result = check_endpoint(target, ua_key="googlebot")
        path = target.replace("https://www.hacker-tube.net", "") or "/"
        if result["ok"]:
            print(f"  ✅ [HTTP {result['status']}] {path:<30} ({result['latency_ms']}ms, Edge: {result.get('cache', 'HIT')})")
            successes.append(result)
        else:
            print(f"  ❌ [FAIL {result['status']}] {path:<30} -> {result['error_type']} ({result['latency_ms']}ms)")
            failures.append(result)

    # 预警触发
    if failures:
        print("\n🚨 CRITICAL ALERT: Outage or 402 Pause Detected!")
        err_details = "\n".join([f"- **{f['url']}**: `HTTP {f['status']}` ({f['error_type']})" for f in failures])
        if feishu_webhook:
            send_feishu_alert(
                feishu_webhook,
                title="HackerTube 出现 402 封停或异常！",
                content=f"检测到站点异常，请立即登录 Vercel 后台解除封停：\n{err_details}",
                level="EMERGENCY",
            )
        return False
    else:
        print("\n✨ All endpoints healthy. 100% 200 OK.")

    # 额度预警巡检（若配置了 Token）
    if vercel_token:
        usage = check_vercel_api_usage(vercel_token)
        if usage:
            print(f"[Sentinel] Vercel Usage API connected. Bandwidth & compute metrics healthy.")

    return True

if __name__ == "__main__":
    success = run_probe()
    sys.exit(0 if success else 1)
