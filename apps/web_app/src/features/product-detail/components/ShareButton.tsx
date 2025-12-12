import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { shareToKakao, copyToClipboard, generateShareUrl } from "@/shared/lib/share";

interface ShareButtonProps {
  productId: string;
  productTitle: string;
}

export function ShareButton({ productId, productTitle }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = generateShareUrl(productId);

  const handleShare = async (method: "kakao" | "link") => {
    if (method === "kakao") {
      shareToKakao(shareUrl, productTitle, `${productTitle} 최저가 비교`);
    } else {
      await copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        공유하기
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 z-10 min-w-[200px]">
          <div className="space-y-2">
            <button
              onClick={() => handleShare("kakao")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              카카오톡 공유
            </button>
            <button
              onClick={() => handleShare("link")}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copied ? "✓ 링크 복사됨" : "링크 복사"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

