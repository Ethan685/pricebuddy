/**
 * 이메일 발송 시스템
 * SendGrid 또는 AWS SES 지원
 */

interface EmailConfig {
  provider: "sendgrid" | "ses";
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

const EMAIL_CONFIG: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as any) || "sendgrid",
  apiKey: process.env.EMAIL_API_KEY || "",
  fromEmail: process.env.EMAIL_FROM || "noreply@pricebuddy.com",
  fromName: process.env.EMAIL_FROM_NAME || "PriceBuddy",
};

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * SendGrid로 이메일 발송
 */
async function sendWithSendGrid(message: EmailMessage): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EMAIL_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: message.to }],
            subject: message.subject,
          },
        ],
        from: {
          email: EMAIL_CONFIG.fromEmail,
          name: EMAIL_CONFIG.fromName,
        },
        content: [
          {
            type: "text/html",
            value: message.html,
          },
          ...(message.text
            ? [
                {
                  type: "text/plain",
                  value: message.text,
                },
              ]
            : []),
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("SendGrid error:", error);
    return false;
  }
}

/**
 * AWS SES로 이메일 발송
 */
async function sendWithSES(message: EmailMessage): Promise<boolean> {
  try {
    // AWS SES API 호출
    // 실제로는 AWS SDK 사용 권장
    const response = await fetch(
      `https://email.${process.env.AWS_REGION || "ap-northeast-2"}.amazonaws.com/`,
      {
        method: "POST",
        headers: {
          "Authorization": `AWS4-HMAC-SHA256 Credential=${EMAIL_CONFIG.apiKey}`,
          "Content-Type": "application/x-amz-json-1.0",
        },
        body: JSON.stringify({
          Destination: {
            ToAddresses: [message.to],
          },
          Message: {
            Subject: {
              Data: message.subject,
              Charset: "UTF-8",
            },
            Body: {
              Html: {
                Data: message.html,
                Charset: "UTF-8",
              },
              ...(message.text
                ? {
                    Text: {
                      Data: message.text,
                      Charset: "UTF-8",
                    },
                  }
                : {}),
            },
          },
          Source: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("AWS SES error:", error);
    return false;
  }
}

/**
 * 이메일 발송 (통합 함수)
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!EMAIL_CONFIG.apiKey) {
    console.warn("Email API key not configured, skipping email send");
    return false;
  }

  if (EMAIL_CONFIG.provider === "sendgrid") {
    return sendWithSendGrid(message);
  } else if (EMAIL_CONFIG.provider === "ses") {
    return sendWithSES(message);
  } else {
    console.error("Unsupported email provider");
    return false;
  }
}

/**
 * 가격 알림 이메일 템플릿
 */
export function createPriceAlertEmail(
  productTitle: string,
  targetPrice: number,
  currentPrice: number,
  productUrl: string
): EmailMessage {
  const discountPct = Math.round(
    ((targetPrice - currentPrice) / targetPrice) * 100
  );

  return {
    to: "", // 호출 시 설정
    subject: `🎉 PriceBuddy 알림: ${productTitle} 가격 하락!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .price-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .current-price { font-size: 32px; font-weight: bold; color: #10b981; }
            .target-price { font-size: 18px; color: #6b7280; text-decoration: line-through; }
            .discount { font-size: 24px; color: #ef4444; font-weight: bold; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 목표 가격에 도달했습니다!</h1>
            </div>
            <div class="content">
              <h2>${productTitle}</h2>
              <div class="price-box">
                <div class="current-price">${currentPrice.toLocaleString()}원</div>
                <div class="target-price">목표: ${targetPrice.toLocaleString()}원</div>
                <div class="discount">${discountPct}% 절약!</div>
              </div>
              <p>설정하신 목표 가격에 도달했습니다. 지금 바로 확인해보세요!</p>
              <a href="${productUrl}" class="button">상품 보러가기</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
PriceBuddy 가격 알림

${productTitle}
현재 가격: ${currentPrice.toLocaleString()}원
목표 가격: ${targetPrice.toLocaleString()}원
${discountPct}% 절약!

${productUrl}
    `,
  };
}

