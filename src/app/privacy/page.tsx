import Link from "next/link";
import { Brand } from "@/components/brand";
export const metadata = { title: "Privacy | Second Date" };
export default function PrivacyPage() {
  return <main style={{maxWidth:760,margin:"0 auto",padding:"48px 24px 90px",lineHeight:1.7}}>
    <Brand /><h1 style={{fontFamily:"Georgia,serif",fontSize:48,fontWeight:400,marginTop:55}}>Privacy</h1>
    <p><strong>Last updated: September 22, 2026.</strong></p>
    <p>Second Date is designed to collect only what is needed to operate the service. The static GitHub Pages preview stores item data in your browser. The hosted version may store account details, item records, subscription status, reminder preferences, and limited product-usage events needed to operate and improve the service.</p>
    <h2>Information we use</h2><p>When you create an account, we may store your email address, a one-way password hash, session information, the items and dates you enter, and product events such as creating or completing an item. Payment-card details are handled by the payment provider and are not stored by Second Date.</p>
    <h2>How information is used</h2><p>Information is used to provide your workspace, synchronize subscription access, deliver reminders you enable, troubleshoot the service, and understand aggregate product usage. Second Date does not sell personal information.</p>
    <h2>Retention and control</h2><p>Browser-preview data can be cleared through your browser storage controls. Hosted-account data is retained while needed to provide the service and meet legitimate operational or legal requirements. Before a public commercial launch, account deletion and data-export controls should be enabled alongside a support contact.</p>
    <h2>Important boundary</h2><p>Second Date records dates and periods supplied by users. It does not determine whether food, medicine, cosmetics, or other products are safe to use.</p>
    <p><Link href="/">← Back to Second Date</Link></p>
  </main>;
}