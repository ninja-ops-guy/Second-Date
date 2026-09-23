import Link from "next/link";
import { Brand } from "@/components/brand";
export const metadata = { title: "Terms | Second Date" };
export default function TermsPage() {
  return <main style={{maxWidth:760,margin:"0 auto",padding:"48px 24px 90px",lineHeight:1.7}}>
    <Brand /><h1 style={{fontFamily:"Georgia,serif",fontSize:48,fontWeight:400,marginTop:55}}>Terms</h1>
    <p><strong>Last updated: September 22, 2026.</strong></p>
    <p>Second Date is a personal organization tool for recording when products were opened and the after-opening periods users choose to track.</p>
    <h2>No safety determination</h2><p>Second Date does not inspect products and does not determine freshness, quality, medical suitability, or safety. Dates shown by the service are reminders calculated from information entered by the user. Always follow manufacturer instructions, storage requirements, recalls, professional guidance, and applicable food or product-safety advice.</p>
    <h2>Your account and content</h2><p>You are responsible for information entered into your workspace and for maintaining access to your account. Do not use the service for unlawful activity or attempt to interfere with its operation.</p>
    <h2>Subscriptions</h2><p>If paid plans are enabled, the price and billing interval are shown before checkout. Subscription management and cancellation are provided through the billing portal. Commercial launch terms should additionally state refund, tax, renewal, and jurisdiction-specific consumer rights before accepting live payments.</p>
    <h2>Service availability</h2><p>The service may change as the product develops. Preview and beta features may be modified or withdrawn. To the extent permitted by law, the service is provided without guarantees that it will be uninterrupted or error-free.</p>
    <p><Link href="/">← Back to Second Date</Link></p>
  </main>;
}