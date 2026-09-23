import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Clock3,
  Heart,
  Leaf,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";

const steps = [
  { icon: PackageOpen, label: "01 / OPEN IT", title: "Open something good.", body: "Pesto, oat milk, face cream, vitamins—anything with an after-opening window worth remembering." },
  { icon: Clock3, label: "02 / DATE IT", title: "Give it a second date.", body: "Add the opening date and the period on its label. Your personal use-by view appears in seconds." },
  { icon: Heart, label: "03 / ENJOY IT", title: "Use it, don’t lose it.", body: "See what deserves attention next, finish it with satisfaction, and keep a record of what you used." },
];

const faqs = [
  ["Does Second Date decide whether something is safe?", "No. You enter the after-opening period shown on the product or a period you have verified yourself. Always follow package directions and storage guidance."],
  ["Do I need an account to try it?", "No. Your first visit opens a guest space with removable examples. Create a free account whenever you want your space tied to your email."],
  ["What happens when I hit 8 active items?", "Finish or remove an item to make room for another, or choose Plus for unlimited active timers."],
  ["Can I cancel Plus?", "Yes. Manage or cancel through the secure billing portal in your account. Your existing items stay in your space."],
];

export default function HomePage() {
  return (
    <div className="marketing-page">
      <div className="announcement-bar">A little less waste. A lot more of the good stuff. <span>✳</span></div>
      <header className="site-header">
        <div className="site-header-inner page-container">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a><a href="#why-second-date">Why Second Date</a><a href="#pricing">Pricing</a>
          </nav>
          <div className="header-actions"><Link className="header-login" href="/app?signin=1">Log in</Link><Link className="button button-dark button-small" href="/app">Get started <ArrowUpRight size={15} /></Link></div>
        </div>
      </header>

      <main>
        <section className="hero page-container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> MEET YOUR NEW LITTLE HABIT</div>
            <h1>Everything has a <em>second date.</em></h1>
            <p className="hero-description">The printed date is only half the story. Keep track of what happens after you open something, and use the good stuff while it’s still good.</p>
            <div className="hero-actions"><Link href="/app" className="button button-dark button-large">Start for free <ArrowUpRight size={19} /></Link><a href="#how-it-works" className="text-link">See how it works <ArrowRight size={18} /></a></div>
            <div className="hero-footnote"><CircleCheck size={16} /> No barcodes. No spreadsheets. No sign-up to try it.</div>
          </div>
          <div className="hero-visual" aria-label="Example Second Date dashboard cards">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-shelf"><span>🌿</span><span>🥛</span><span>🧴</span></div>
            <div className="hero-card">
              <div className="hero-card-top"><span><i /> YOUR GENTLE NUDGE</span><Clock3 size={17} /></div>
              <div className="hero-card-content"><div className="hero-card-emoji">🌿</div><div><strong>Basil pesto</strong><span>Opened 5 days ago</span></div></div>
              <div className="hero-card-bottom"><span>Perfect for pasta night</span><b>2 days left</b></div><div className="hero-card-progress"><span /></div>
            </div>
            <div className="hero-sticker">use the<br /><em>good stuff</em><span>✳</span></div>
          </div>
        </section>

        <div className="promise-strip"><div className="page-container promise-inner"><span>LESS GUESSING</span><i>✳</i><span>MORE USING</span><i>✳</i><span>HAPPIER SHELVES</span></div></div>

        <section id="how-it-works" className="how-section section-pad"><div className="page-container">
          <div className="section-heading centered"><p className="section-kicker"><span>01</span> THE IDEA</p><h2>There’s the printed date.<br /><em>Then there’s the real-life date.</em></h2><p>Once you open something, a new little clock begins. We make that clock easy to see.</p></div>
          <div className="steps-grid">{steps.map(({ icon: Icon, label, title, body }) => <article className="step-card" key={label}><div className="step-top"><span>{label}</span><div className="step-icon"><Icon size={26} strokeWidth={1.7} /></div></div><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div></section>

        <section id="why-second-date" className="showcase-section section-pad"><div className="page-container showcase-grid">
          <div className="showcase-copy"><p className="section-kicker"><span>02</span> MADE FOR REAL LIFE</p><h2>A little list.<br /><em>A lot less</em><br />“is this still good?”</h2><p className="showcase-lead">Your open things, all in one calm place. No rummaging or trying to remember when you twisted the lid.</p>
            <div className="showcase-benefits"><div><Leaf size={21} /><span><strong>See what needs love first</strong><p>Sort by what’s coming up soon.</p></span></div><div><Sparkles size={21} /><span><strong>For more than the fridge</strong><p>Food, beauty, wellness, and home.</p></span></div><div><Check size={21} /><span><strong>Feel good about finishing</strong><p>Mark things used and see the wins add up.</p></span></div></div>
          </div>
          <div className="product-preview"><div className="preview-browser"><i /><i /><i /><span>your little space / today</span></div><div className="preview-body"><small>YOUR OPEN THINGS ✳</small><h3>Good morning, you.</h3><p>A little look at what’s worth using.</p><div className="preview-insight">💡 <span><b>Make it a pesto kind of day</b><small>A gentle nudge for something good.</small></span></div>{[["🌿","Basil pesto","2 days"],["🥛","Oat milk","4 days"],["🧴","Vitamin C serum","66 days"]].map(([emoji,name,time]) => <div className="preview-item" key={name}><span>{emoji}</span><div><b>{name}</b><small>Opened recently</small></div><em>{time}</em></div>)}</div></div>
        </div></section>

        <section id="pricing" className="pricing-section section-pad"><div className="page-container"><div className="section-heading centered"><p className="section-kicker"><span>03</span> SIMPLE PRICING</p><h2>Start small. <em>Stay as long as you like.</em></h2><p>A free space for your open things. More room and thoughtful extras when you want them.</p></div>
          <div className="pricing-grid"><article className="price-card"><small>FOR GETTING STARTED</small><h3>Free</h3><div className="price-line"><strong>$0</strong><span>/ forever</span></div><Link href="/app" className="button button-outline">Start for free <ArrowUpRight size={18} /></Link><ul><li><Check size={17}/> Track up to 8 open things</li><li><Check size={17}/> See what is coming up soon</li><li><Check size={17}/> Food, beauty, wellness &amp; home</li></ul></article>
          <article className="price-card plus-card"><span className="popular-badge">FOR THE WHOLE SHELF ✦</span><small>FOR THE EVERYDAY ROUTINE</small><h3>Plus</h3><div className="price-line"><strong>$24</strong><span>/ year</span></div><p>Or $2.99 monthly.</p><Link href="/app?upgrade=year" className="button button-light">Choose Plus <ArrowUpRight size={18} /></Link><ul><li><Check size={17}/> Unlimited open things</li><li><Check size={17}/> Email Second Date reminders</li><li><Check size={17}/> Printable label sheets</li><li><Check size={17}/> Personal use-up insights</li></ul></article></div>
        </div></section>

        <section className="faq-section section-pad"><div className="page-container faq-grid"><div><p className="section-kicker"><span>04</span> GOOD TO KNOW</p><h2>A few little<br /><em>questions.</em></h2></div><div className="faq-list">{faqs.map(([q,a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>
        <section className="final-cta page-container"><div><p>YOUR FUTURE SELF SAYS THANK YOU</p><h2>Open it. Date it.<br /><em>Enjoy every last bit.</em></h2><Link href="/app" className="button button-light button-large">Give it a try <ArrowUpRight size={19}/></Link></div><span className="cta-spark">✳</span></section>
      </main>
      <footer className="site-footer"><div className="page-container footer-top"><div><Brand /><p>A little home for everything you open.<br />Made for making the most of what you have.</p></div><div><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a><Link href="/app">Open the app</Link></div></div><div className="page-container footer-bottom"><span>© {new Date().getFullYear()} Second Date.</span><span>Use the good stuff ✳</span></div></footer>
    </div>
  );
}
