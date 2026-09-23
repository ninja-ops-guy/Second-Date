(() => {
  if (document.body.dataset.page !== "app") return;

  const STORAGE_KEY = "second-date-items-v2";
  const categories = ["Food","Beauty","Wellness","Home"];
  let activeTab = "active";
  let search = "";
  let selectedCategory = "Food";
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const todayISO = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  };
  const addDays = (iso, days) => {
    const [y,m,d] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(y,m-1,d) + days*86400000);
    return date.toISOString().slice(0,10);
  };
  const daysLeft = (item) => {
    const t = new Date(todayISO()+"T00:00:00Z").getTime();
    const o = new Date(item.openedAt+"T00:00:00Z").getTime();
    return item.useWithinDays - Math.round((t-o)/86400000);
  };
  const fmt = (iso) => new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const short = (iso) => new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const emoji = (item) => {
    const n = item.name.toLowerCase();
    if (n.includes("pesto") || n.includes("basil")) return "🌿";
    if (n.includes("milk")) return "🥛";
    if (n.includes("serum") || n.includes("cream")) return "🧴";
    if (n.includes("vitamin")) return "💊";
    if (n.includes("tahini") || n.includes("butter")) return "🥜";
    return {Food:"🍋",Beauty:"✨",Wellness:"🌱",Home:"🧼"}[item.category] || "📦";
  };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
  const seed = () => {
    const t = todayISO();
    return [
      {id:uid(),name:"Basil pesto",category:"Food",openedAt:addDays(t,-5),useWithinDays:7,note:"A little pasta night inspiration.",status:"active",isExample:true},
      {id:uid(),name:"Oat milk",category:"Food",openedAt:addDays(t,-3),useWithinDays:7,note:"",status:"active",isExample:true},
      {id:uid(),name:"Vitamin C serum",category:"Beauty",openedAt:addDays(t,-24),useWithinDays:90,note:"",status:"active",isExample:true},
      {id:uid(),name:"Tahini",category:"Food",openedAt:addDays(t,-12),useWithinDays:45,note:"",status:"active",isExample:true}
    ];
  };
  const read = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const items = seed();
    write(items);
    return items;
  };
  const write = (items) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  };
  const escapeHtml = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function notify(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").hidden = false;
    toastTimer = setTimeout(() => $("toast").hidden = true, 2800);
  }

  function render() {
    const all = read();
    const active = all.filter(i => i.status === "active").sort((a,b) => daysLeft(a)-daysLeft(b));
    const history = all.filter(i => i.status !== "active");
    const realActive = active.filter(i => !i.isExample);
    const visibleSource = activeTab === "active" ? active : history;
    const visible = visibleSource.filter(i => (i.name+" "+i.category).toLowerCase().includes(search.toLowerCase()));

    $("active-count").textContent = realActive.length;
    $("stat-open").textContent = active.length;
    $("stat-soon").textContent = active.filter(i => daysLeft(i) <= 3).length;
    $("stat-used").textContent = history.filter(i => i.status === "used").length;
    $("tab-active-count").textContent = active.length;
    $("tab-history-count").textContent = history.length;
    $("example-note").hidden = !(activeTab === "active" && active.some(i => i.isExample));

    document.querySelectorAll("[data-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === activeTab));

    const top = active[0];
    if (top) {
      const left = daysLeft(top);
      $("nudge-title").textContent = left <= 0 ? top.name + " has reached its Second Date." : "Make it a " + top.name.toLowerCase() + " kind of day.";
      $("nudge-copy").textContent = left < 0 ? Math.abs(left)+" day"+(Math.abs(left)===1?"":"s")+" past your reminder." : left === 0 ? "Today is its Second Date." : left+" day"+(left===1?"":"s")+" left. Always follow the product’s own guidance.";
    } else {
      $("nudge-title").textContent = "Use the good stuff.";
      $("nudge-copy").textContent = "Add something you opened and Second Date will keep the clock visible.";
    }

    if (!visible.length) {
      $("items").innerHTML = '<div class="empty"><span>✳</span><h3>'+(search ? "Nothing matches that search." : activeTab === "active" ? "Nothing open yet." : "No history yet.")+'</h3><p>'+(activeTab === "active" ? "Add something when you twist a lid, break a seal, or open a bottle." : "Used and discarded items will show up here.")+'</p></div>';
      return;
    }

    $("items").innerHTML = visible.map(item => {
      const left = daysLeft(item);
      const end = addDays(item.openedAt,item.useWithinDays);
      const label = left < 0 ? Math.abs(left)+" day"+(Math.abs(left)===1?"":"s")+" past" : left === 0 ? "Today" : left+" day"+(left===1?"":"s")+" left";
      const tone = item.status !== "active" ? item.status : left <= 0 ? "due" : left <= 3 ? "soon" : "";
      return '<article class="item" data-id="'+escapeHtml(item.id)+'">'+
        '<div class="item-emoji">'+emoji(item)+'</div>'+
        '<div class="item-main"><div class="item-title"><strong>'+escapeHtml(item.name)+'</strong>'+(item.isExample?'<span class="example-pill">EXAMPLE</span>':'')+'</div><small>'+escapeHtml(item.category)+' · opened '+fmt(item.openedAt)+'</small>'+(item.note?'<p>'+escapeHtml(item.note)+'</p>':'')+'</div>'+
        '<div class="item-date"><small>'+(item.status==="active"?"SECOND DATE":"COMPLETED")+'</small><strong>'+(item.status==="active"?short(end): item.completedAt ? new Date(item.completedAt).toLocaleDateString():"—")+'</strong></div>'+
        '<span class="status '+tone+'">'+(item.status==="active"?label:item.status==="used"?"Used up":"Discarded")+'</span>'+
        '<div class="row-actions">'+
          (item.status==="active" ? '<button data-action="used" title="Mark used">✓</button><button data-action="edit" title="Edit">✎</button><button data-action="discarded" title="Discard">⌫</button>' : '<button data-action="delete" title="Delete">⌫</button>')+
        '</div></article>';
    }).join("");
  }

  function openNew() {
    $("item-form").reset();
    $("item-id").value = "";
    $("opened-at").value = todayISO();
    $("days").value = "7";
    $("modal-kicker").textContent = "A NEW SECOND DATE";
    $("modal-title").textContent = "What did you open?";
    selectedCategory = "Food";
    updateCategoryButtons();
    $("item-dialog").showModal();
  }

  function openEdit(item) {
    $("item-id").value = item.id;
    $("name").value = item.name;
    $("opened-at").value = item.openedAt;
    $("days").value = item.useWithinDays;
    $("note").value = item.note || "";
    $("modal-kicker").textContent = "EDIT YOUR THING";
    $("modal-title").textContent = "Tidy up the details.";
    selectedCategory = item.category;
    updateCategoryButtons();
    $("item-dialog").showModal();
  }

  function updateCategoryButtons() {
    document.querySelectorAll("[data-category]").forEach(btn => btn.classList.toggle("selected", btn.dataset.category === selectedCategory));
  }

  $("add-button").addEventListener("click", openNew);
  $("close-dialog").addEventListener("click", () => $("item-dialog").close());
  $("search").addEventListener("input", e => { search = e.target.value; render(); });
  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => { activeTab = btn.dataset.tab; render(); }));
  document.querySelectorAll("[data-category]").forEach(btn => btn.addEventListener("click", () => { selectedCategory = btn.dataset.category; updateCategoryButtons(); }));

  $("item-form").addEventListener("submit", e => {
    e.preventDefault();
    const all = read();
    const id = $("item-id").value;
    const name = $("name").value.trim();
    const openedAt = $("opened-at").value;
    const useWithinDays = Number($("days").value);
    const note = $("note").value.trim();
    if (!name || !openedAt || !Number.isInteger(useWithinDays) || useWithinDays < 1) return;

    if (!id) {
      const realActive = all.filter(i => i.status === "active" && !i.isExample).length;
      if (realActive >= 8) { notify("Your free browser space holds 8 active items."); return; }
      const cleaned = all.filter(i => !i.isExample);
      cleaned.push({id:uid(),name,category:selectedCategory,openedAt,useWithinDays,note,status:"active",isExample:false});
      write(cleaned);
      notify("Added to your space.");
    } else {
      const item = all.find(i => i.id === id);
      if (!item) return;
      Object.assign(item,{name,category:selectedCategory,openedAt,useWithinDays,note});
      write(all);
      notify("Updated.");
    }
    $("item-dialog").close();
    render();
  });

  $("items").addEventListener("click", e => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const row = button.closest("[data-id]");
    const all = read();
    const item = all.find(i => i.id === row.dataset.id);
    if (!item) return;
    const action = button.dataset.action;
    if (action === "edit") return openEdit(item);
    if (action === "used" || action === "discarded") {
      item.status = action;
      item.completedAt = new Date().toISOString();
      write(all); notify(action === "used" ? "Nice — another thing used up ✦" : "Marked discarded."); render(); return;
    }
    if (action === "delete") {
      if (confirm("Remove "+item.name+" from history?")) {
        write(all.filter(i => i.id !== item.id)); notify("Removed."); render();
      }
    }
  });

  $("opened-at").max = todayISO();
  render();
})();