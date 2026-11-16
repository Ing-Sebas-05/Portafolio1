/* =====================================================
   CONFIGURACIÓN  (edita aquí tus datos)
===================================================== */
const CONFIG = {
    // Frases que se escriben en el hero
    frases: ["Apasionado por aprender"],

    // Redes sociales. Deja "" en las que no quieras mostrar.
    redes: {
        instagram: "https://www.instagram.com/88___sebass/",
        github:    "https://github.com/Ing-Sebas-05",
        linkedin:  "https://www.linkedin.com/in/sebastian-posada-265513333/",   // pon aquí la URL de TU perfil: https://www.linkedin.com/in/tu-usuario
        whatsapp:  "https://wa.me/88___sebass?s=p"    // pon aquí la URL de TU perfil
    },

    // Formulario de contacto. Elige UNA opción:
    //  1) formspree: crea un formulario gratis en https://formspree.io y pega el ID (ej. "xyzabcde").
    //     Los mensajes llegan a tu correo sin abrir el cliente de correo del visitante.
    //  2) email: si no usas Formspree, se abrirá el programa de correo del visitante con el mensaje listo.
    formspree: "xrpqeyjo", 
    email: ""
};

/* =====================================================
   UTILIDADES
===================================================== */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* sin acceso */ } }
};

function esc(str) {
    const d = document.createElement("div");
    d.textContent = String(str ?? "");
    return d.innerHTML;
}

// Solo permite enlaces http(s) o rutas relativas (evita javascript:)
function urlSegura(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:\/\/|\.?\/?[\w\-./%]+$|data:image\/)/i.test(u) && !/^\s*javascript:/i.test(u)) return u;
    return "";
}

function toast(msg, tipo = "") {
    const t = document.createElement("div");
    t.className = "toast " + tipo;
    t.textContent = msg;
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 4500);
}

/* =====================================================
   NAVBAR: menú móvil, scrollspy, tema
===================================================== */
const menu = $("#menu");
const menuBtn = $("#menuBtn");

menuBtn.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    menuBtn.setAttribute("aria-expanded", abierto);
    menuBtn.firstElementChild.className = abierto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});
$$("#menu a").forEach(a => a.addEventListener("click", () => {
    menu.classList.remove("abierto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.firstElementChild.className = "fa-solid fa-bars";
}));

// Resalta el enlace de la sección visible
const enlaces = $$("#menu a[href^='#']");
const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            enlaces.forEach(a => a.classList.toggle("activo", a.getAttribute("href") === "#" + en.target.id));
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main > header, main > section").forEach(s => spy.observe(s));

// Tema claro / oscuro
const temaBtn = $("#temaBtn");
function aplicarTema(t) {
    if (t === "claro") document.documentElement.dataset.tema = "claro";
    else delete document.documentElement.dataset.tema;
    temaBtn.firstElementChild.className = t === "claro" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === "claro" ? "#f8fafc" : "#0f172a";
}
aplicarTema(store.get("tema") || "oscuro");
temaBtn.addEventListener("click", () => {
    const nuevo = document.documentElement.dataset.tema === "claro" ? "oscuro" : "claro";
    aplicarTema(nuevo);
    store.set("tema", nuevo);
});

/* =====================================================
   HERO: foto con respaldo, redes, texto animado
===================================================== */
const foto = $("#fotoPerfil");
function fotoFallida() { foto.hidden = true; $("#fotoFallback").hidden = false; }
foto.addEventListener("error", fotoFallida);
if (foto.complete && foto.naturalWidth === 0) fotoFallida();

const iconosRedes = { instagram: "fa-instagram", whatsapp: "fa-whatsapp", linkedin: "fa-linkedin-in", github: "fa-github" };
const contRedes = $("#redes");
Object.entries(CONFIG.redes).forEach(([red, url]) => {
    const u = urlSegura(url);
    if (!u) return;
    const a = document.createElement("a");
    a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.className = "social " + red; a.setAttribute("aria-label", red);
    a.innerHTML = `<i class="fab ${iconosRedes[red]}"></i>`;
    contRedes.appendChild(a);
});
if (!contRedes.children.length) contRedes.hidden = true;

// Efecto de escritura
(function escribir() {
    const el = $("#typing");
    const frases = CONFIG.frases;
    if (!frases.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = frases[0]; return; }
    let f = 0, c = 0, borrando = false;
    (function paso() {
        const frase = frases[f];
        el.textContent = frase.slice(0, c);
        let espera = borrando ? 40 : 85;
        if (!borrando && c === frase.length) { borrando = true; espera = 1600; }
        else if (borrando && c === 0) { borrando = false; f = (f + 1) % frases.length; espera = 350; }
        c += borrando ? -1 : 1;
        setTimeout(paso, espera);
    })();
})();

$("#anio").textContent = new Date().getFullYear();

// Aparición al hacer scroll
const rev = new IntersectionObserver((entries, o) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); o.unobserve(en.target); } });
}, { threshold: 0.12 });
const observarReveal = ctx => $$(".reveal:not(.visible)", ctx).forEach(el => rev.observe(el));
observarReveal();

/* =====================================================
   PROYECTOS
===================================================== */
const CLAVE = "portafolio.proyectos.v1";
const CLAVE_ADMIN = "portafolio.admin";
const defecto = Array.isArray(window.PROYECTOS) ? window.PROYECTOS : [];

function cargarProyectos() {
    const guardado = store.get(CLAVE);
    if (guardado) {
        try {
            const arr = JSON.parse(guardado);
            if (Array.isArray(arr)) return arr;
        } catch { /* usa los de archivo */ }
    }
    return structuredClone(defecto);
}

let proyectos = cargarProyectos();
let filtroActual = "Todos";

// El modo admin solo se activa entrando una vez con ?admin en la dirección (queda recordado en este navegador)
if (new URLSearchParams(location.search).has("admin")) store.set(CLAVE_ADMIN, "1");
let modoAdmin = store.get(CLAVE_ADMIN) === "1";

let editandoId = null;
let imagenData = ""; // imagen subida (dataURL) del formulario

function guardar() {
    const ok = store.set(CLAVE, JSON.stringify(proyectos));
    if (!ok) toast("No se pudo guardar en este navegador (almacenamiento lleno o bloqueado). Usa Exportar.", "error");
}

const gradientes = [
    ["#0ea5e9", "#6366f1"], ["#ef4444", "#f97316"], ["#10b981", "#0ea5e9"],
    ["#8b5cf6", "#ec4899"], ["#f59e0b", "#ef4444"], ["#14b8a6", "#6366f1"]
];
function gradiente(titulo) {
    let h = 0;
    for (const ch of titulo) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const [a, b] = gradientes[h % gradientes.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
}

function tarjeta(p) {
    const img = urlSegura(p.imagen);
    const demo = urlSegura(p.demo), repo = urlSegura(p.repo);
    const portada = img
        ? `<div class="proy-img"><img src="${esc(img)}" alt="Captura de ${esc(p.titulo)}" loading="lazy"
             onerror="this.parentNode.className='proy-img placeholder';this.parentNode.style.background='${gradiente(p.titulo)}';this.outerHTML='<i class=&quot;fa-solid fa-code&quot;></i>'"></div>`
        : `<div class="proy-img placeholder" style="background:${gradiente(p.titulo)}"><i class="fa-solid fa-code"></i></div>`;
    const tags = (p.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
    const links = [
        demo ? `<a href="${esc(demo)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i>Demo</a>` : "",
        repo ? `<a href="${esc(repo)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i>Código</a>` : ""
    ].join("");
    const admin = modoAdmin ? `
        <div class="proy-admin">
            <button data-accion="editar" data-id="${esc(p.id)}"><i class="fa-solid fa-pen"></i> Editar</button>
            <button class="borrar" data-accion="borrar" data-id="${esc(p.id)}"><i class="fa-solid fa-trash"></i> Eliminar</button>
        </div>` : "";
    return `<article class="proyecto reveal">
        ${portada}
        <div class="proy-cuerpo">
            <h3>${esc(p.titulo)}</h3>
            <p>${esc(p.desc)}</p>
            ${tags ? `<div class="tags">${tags}</div>` : ""}
            ${links ? `<div class="proy-links">${links}</div>` : ""}
        </div>${admin}
    </article>`;
}

function renderFiltros() {
    const tags = [...new Set(proyectos.flatMap(p => p.tags || []))].sort((a, b) => a.localeCompare(b, "es"));
    if (filtroActual !== "Todos" && !tags.includes(filtroActual)) filtroActual = "Todos";
    $("#filtros").innerHTML = ["Todos", ...tags].map(t =>
        `<button class="filtro ${t === filtroActual ? "activo" : ""}" data-tag="${esc(t)}" aria-pressed="${t === filtroActual}">${esc(t)}</button>`
    ).join("");
    $("#filtros").hidden = tags.length === 0;
}

function renderProyectos() {
    renderFiltros();
    const lista = proyectos.filter(p => filtroActual === "Todos" || (p.tags || []).includes(filtroActual));
    const grid = $("#proyectosGrid");
    grid.innerHTML = lista.map(tarjeta).join("");
    $("#proyectosVacio").hidden = lista.length > 0;
    observarReveal(grid);
    // Asegura que las tarjetas aparezcan aunque el observer tarde
    requestAnimationFrame(() => $$(".proyecto", grid).forEach(el => el.classList.add("visible")));
}

$("#filtros").addEventListener("click", e => {
    const b = e.target.closest(".filtro");
    if (!b) return;
    filtroActual = b.dataset.tag;
    renderProyectos();
});

$("#proyectosGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-accion]");
    if (!b) return;
    const p = proyectos.find(x => x.id === b.dataset.id);
    if (!p) return;
    if (b.dataset.accion === "editar") abrirModal(p);
    if (b.dataset.accion === "borrar" && confirm(`¿Eliminar "${p.titulo}"?`)) {
        proyectos = proyectos.filter(x => x.id !== p.id);
        guardar(); renderProyectos();
        toast("Proyecto eliminado.", "ok");
    }
});

/* ---------- Modo administrador ---------- */
function aplicarAdmin() {
    $$(".admin-only").forEach(el => el.hidden = !modoAdmin);
    const t = $("#adminToggle");
    t.hidden = !modoAdmin;   // los visitantes no ven el botón
    t.innerHTML = modoAdmin ? '<i class="fa-solid fa-lock-open"></i> <span>Salir de admin</span>'
                            : '<i class="fa-solid fa-lock"></i> <span>Administrar</span>';
    renderProyectos();
}

$("#adminToggle").addEventListener("click", () => {
    modoAdmin = false;
    store.del(CLAVE_ADMIN);
    aplicarAdmin();
});

/* ---------- Modal crear / editar ---------- */
const modal = $("#modalProyecto");
const fProy = $("#formProyecto");

function mostrarPreview(src) {
    $("#imgPreview").hidden = !src;
    if (src) $("#imgPreviewImg").src = src;
}

function abrirModal(p = null) {
    editandoId = p ? p.id : null;
    $("#modalTitulo").textContent = p ? "Editar proyecto" : "Nuevo proyecto";
    $("#pTitulo").value = p?.titulo || "";
    $("#pDesc").value = p?.desc || "";
    $("#pTags").value = (p?.tags || []).join(", ");
    $("#pDemo").value = p?.demo || "";
    $("#pRepo").value = p?.repo || "";
    $("#pImgFile").value = "";
    imagenData = "";
    const img = p?.imagen || "";
    if (img.startsWith("data:")) { imagenData = img; $("#pImgUrl").value = ""; }
    else $("#pImgUrl").value = img;
    mostrarPreview(imagenData || (img ? urlSegura(img) : ""));
    $("#modalError").textContent = "";
    modal.showModal();
    $("#pTitulo").focus();
}
$("#nuevoBtn").addEventListener("click", () => abrirModal());
$$("[data-cerrar]", modal).forEach(b => b.addEventListener("click", () => modal.close()));
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });

// Redimensiona la imagen para que ocupe poco en el navegador
function redimensionar(file, max = 900) {
    return new Promise((res, rej) => {
        if (!file.type.startsWith("image/")) return rej(new Error("El archivo no es una imagen."));
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => {
            const k = Math.min(1, max / Math.max(im.width, im.height));
            const c = document.createElement("canvas");
            c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
            c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            res(c.toDataURL("image/jpeg", 0.82));
        };
        im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("No se pudo leer la imagen.")); };
        im.src = url;
    });
}

$("#pImgFile").addEventListener("change", async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
        imagenData = await redimensionar(f);
        $("#pImgUrl").value = "";
        mostrarPreview(imagenData);
    } catch (err) {
        $("#modalError").textContent = err.message;
    }
});
$("#quitarImg").addEventListener("click", () => {
    imagenData = ""; $("#pImgUrl").value = ""; $("#pImgFile").value = ""; mostrarPreview("");
});

function slug(t) {
    return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "proyecto";
}

fProy.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#modalError");
    const titulo = $("#pTitulo").value.trim();
    const desc = $("#pDesc").value.trim();
    if (!titulo || !desc) { err.textContent = "El título y la descripción son obligatorios."; return; }

    const demo = $("#pDemo").value.trim(), repo = $("#pRepo").value.trim();
    if ((demo && !/^https?:\/\//i.test(demo)) || (repo && !/^https?:\/\//i.test(repo))) {
        err.textContent = "Los enlaces deben empezar con http:// o https://"; return;
    }
    const urlImg = $("#pImgUrl").value.trim();
    if (!imagenData && urlImg && !urlSegura(urlImg)) { err.textContent = "La ruta o URL de la imagen no es válida."; return; }

    const datos = {
        titulo, desc,
        tags: $("#pTags").value.split(",").map(t => t.trim()).filter(Boolean),
        demo, repo,
        imagen: imagenData || urlImg
    };

    if (editandoId) {
        proyectos = proyectos.map(p => p.id === editandoId ? { ...p, ...datos } : p);
    } else {
        let id = slug(titulo), n = 2;
        while (proyectos.some(p => p.id === id)) id = slug(titulo) + "-" + n++;
        proyectos.unshift({ id, ...datos });   // el nuevo aparece primero
    }
    guardar();
    modal.close();
    renderProyectos();
    toast(editandoId ? "Proyecto actualizado." : "Proyecto agregado.", "ok");
});

/* ---------- Exportar / Importar / Restaurar ---------- */
$("#exportarBtn").addEventListener("click", () => {
    const sinBase64 = proyectos.some(p => (p.imagen || "").startsWith("data:"));
    const codigo = "// Generado desde el Modo administrador\nwindow.PROYECTOS = " +
        JSON.stringify(proyectos, null, 2) + ";\n";
    const blob = new Blob([codigo], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "proyectos.js";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Descargado proyectos.js. Reemplaza data/proyectos.js en tu repositorio y haz commit." +
          (sinBase64 ? " Tus imágenes subidas van incluidas dentro del archivo." : ""), "ok");
});

$("#importarBtn").addEventListener("click", () => $("#importarInput").click());
$("#importarInput").addEventListener("change", async e => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
        let txt = (await f.text()).trim();
        txt = txt.replace(/^\s*\/\/.*$/gm, "").replace(/^\s*window\.PROYECTOS\s*=\s*/, "").replace(/;\s*$/, "");
        const arr = JSON.parse(txt);
        if (!Array.isArray(arr) || arr.some(p => !p || !p.titulo || !p.desc)) throw new Error();
        arr.forEach((p, i) => { if (!p.id) p.id = slug(p.titulo) + "-" + i; });
        proyectos = arr; guardar(); renderProyectos();
        toast(`Importados ${arr.length} proyectos.`, "ok");
    } catch {
        toast("Archivo inválido. Usa uno exportado desde aquí.", "error");
    }
});

$("#restaurarBtn").addEventListener("click", () => {
    if (!confirm("Esto descarta tus cambios locales y vuelve a la lista de data/proyectos.js. ¿Continuar?")) return;
    store.del(CLAVE);
    proyectos = structuredClone(defecto);
    renderProyectos();
    toast("Lista restaurada.", "ok");
});

aplicarAdmin();

/* =====================================================
   FORMULARIO DE CONTACTO
===================================================== */
const form = $("#formContacto");
const reglas = {
    nombre:  v => v.trim().length < 2 ? "Escribe tu nombre (mínimo 2 caracteres)." : "",
    correo:  v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Escribe un correo válido.",
    mensaje: v => v.trim().length < 10 ? "El mensaje debe tener al menos 10 caracteres." : ""
};

function validarCampo(nombre) {
    const input = form.elements[nombre];
    const msg = reglas[nombre](input.value);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    $(`.error[data-for="${nombre}"]`).textContent = msg;
    return !msg;
}
Object.keys(reglas).forEach(n => {
    form.elements[n].addEventListener("blur", () => validarCampo(n));
    form.elements[n].addEventListener("input", () => {
        if (form.elements[n].getAttribute("aria-invalid") === "true") validarCampo(n);
    });
});

form.addEventListener("submit", async e => {
    e.preventDefault();
    if (form.elements._gotcha.value) return; // bot
    const validos = Object.keys(reglas).map(validarCampo);
    if (validos.includes(false)) { toast("Revisa los campos marcados.", "error"); return; }

    const datos = {
        nombre: form.elements.nombre.value.trim(),
        correo: form.elements.correo.value.trim(),
        mensaje: form.elements.mensaje.value.trim()
    };
    const btn = $("#enviarBtn");

    if (CONFIG.formspree) {
        btn.disabled = true; btn.textContent = "Enviando…";
        try {
            const r = await fetch("https://formspree.io/f/" + encodeURIComponent(CONFIG.formspree), {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ name: datos.nombre, email: datos.correo, message: datos.mensaje })
            });
            if (!r.ok) throw new Error();
            form.reset();
            toast("¡Mensaje enviado! Te responderé pronto.", "ok");
        } catch {
            toast("No se pudo enviar. Inténtalo de nuevo en un momento.", "error");
        } finally {
            btn.disabled = false; btn.textContent = "Enviar mensaje";
        }
    } else if (CONFIG.email) {
        const asunto = encodeURIComponent("Mensaje desde tu portafolio — " + datos.nombre);
        const cuerpo = encodeURIComponent(`${datos.mensaje}\n\n—\n${datos.nombre} (${datos.correo})`);
        location.href = `mailto:${CONFIG.email}?subject=${asunto}&body=${cuerpo}`;
        toast("Se abrió tu programa de correo para enviar el mensaje.", "ok");
    } else {
        toast("El formulario aún no está configurado: agrega tu correo o ID de Formspree en CONFIG (script.js).", "error");
    }
});
