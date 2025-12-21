import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { shareToKakao, copyToClipboard, generateShareUrl } from "@/shared/lib/share";
import { useTranslation } from "react-i18next";

interface ShareButtonProps {
  productId: string;
  productTitle: string;
}

export function ShareButton({ productId, productTitle }: ShareButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = generateShareUrl(productId);

  const handleShare = async (method: "kakao" | "link") => {
    if (method === "kakao") {
      shareToKakao(shareUrl, productTitle, `${productTitle} ${t("product.shareTitle")}`);
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
        className="w-full shadow-lg border border-primary/20 hover:border-primary/50"
      >
        📤 {t("product.share")}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-4 right-0 z-50 min-w-[320px] animate-fade-in border-primary/30 max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold text-center mb-2 font-display">✨ Brag this Deal</h3>

            {/* Brag Card Preview */}
            <div className="bg-gradient-to-br from-surface to-surfaceHighlight p-4 rounded-xl border border-border/50 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="text-center relative z-10">
                <div className="text-xs text-primary font-bold tracking-widest uppercase mb-1">Found on PriceBuddy</div>
                <div className="text-xl font-bold mb-2 line-clamp-1">{productTitle}</div>
                <div className="text-3xl font-black text-successNeon font-display tracking-tight drop-shadow-lg scale-110 mb-2">
                  BEST PRICE
                </div>
                <div className="text-xs text-textMuted">Check it out now!</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleShare("kakao")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FEE500] text-[#3c1e1e] font-bold hover:bg-[#FEE500]/90 transition-all shadow-md"
              >
                <span>💬</span> {t("product.share.kakao")}
              </button>
              <button
                onClick={() => handleShare("link")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surfaceHighlight hover:bg-border text-textMain transition-all font-medium border border-border"
              >
                <span>🔗</span> {copied ? t("product.share.copied") : t("product.share.copyLink")}
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-textMuted hover:text-textMain underline"
              >
                Close
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
