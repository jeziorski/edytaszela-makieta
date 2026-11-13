// Makieta edytaszela.pl: menu mobilne i formularz poglądowy (bez wysyłki danych)
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');

    if (toggle && nav) {
        // Szuflada: tło, zamknięcie, Escape, inert reszty strony, powrót fokusu
        var backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.hidden = true;
        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'nav-close';
        close.setAttribute('aria-label', 'Zamknij menu');
        close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        nav.insertBefore(close, nav.firstChild);
        nav.parentNode.insertBefore(backdrop, nav);
        var rest = document.querySelectorAll('.skip-link, main, footer, .site-header__logo, .buybar');
        var setOpen = function (open) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            nav.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
            backdrop.hidden = !open;
            rest.forEach(function (el) { el.inert = open; });
            toggle.inert = open;
            if (open) { setTimeout(function () { close.focus(); }, 60); } else { toggle.focus(); }
        };
        toggle.addEventListener('click', function () { setOpen(true); });
        close.addEventListener('click', function () { setOpen(false); });
        backdrop.addEventListener('click', function () { setOpen(false); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 880 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
        });
    }

    // Formularz w makiecie nie wysyła danych, pokazuje tylko komunikat
    document.querySelectorAll('[data-mock-form]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var status = form.querySelector('.ff-message-success') || form.parentNode.querySelector('.ff-message-success');
            status.hidden = false;
            status.setAttribute('tabindex', '-1');
            status.focus();
        });
    });

    // Strona produktu: wybór wariantu zmienia cenę, koszyk w makiecie nie działa
    var vform = document.querySelector('[data-variant-form]');
    if (vform) {
        var priceEl = document.querySelector('[data-price-display]');
        var err = document.getElementById('variant-error');
        var cart = document.getElementById('cart-status');
        vform.addEventListener('change', function (e) {
            if (e.target.name === 'attribute_sesja') {
                priceEl.textContent = e.target.getAttribute('data-price');
                err.hidden = true;
                cart.hidden = true;
            }
        });
        vform.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!vform.querySelector('input[name="attribute_sesja"]:checked')) {
                err.hidden = false;
                vform.querySelector('input[name="attribute_sesja"]').focus();
                return;
            }
            cart.hidden = false;
            cart.focus();
        });
    }

    // Wpis: na mniejszych ekranach spis treści domyślnie zwinięty, żeby tekst zaczynał się od razu
    var toc = document.querySelector('.bp-toc');
    if (toc && window.matchMedia('(max-width: 1024px)').matches) {
        toc.removeAttribute('open');
    }

    // Oferta: delikatne wejście elementów w panelach (bez JS wszystko jest widoczne)
    var ofr = document.querySelector('.ofr');
    if (ofr && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ofr.setAttribute('data-ruch', '');
        new IntersectionObserver(function (e, o) {
            if (e[0].isIntersecting) { ofr.classList.add('is-in'); o.disconnect(); }
        }, { threshold: .05 }).observe(ofr);
    }

    // Tablica sciezek: gra z cyframi, dwa warianty do wyboru przez klientke.
    // Domyslny: cyfry nad widoczna lista, przypisanie losowe przy kazdym wejsciu.
    // ?gra=modal: lista ukryta, cyfra otwiera okno z jedna sciezka (przypisanie stale, 1-5 w kolejnosci listy).
    // Bez JS blok gry jest ukryty, a lista zawsze widoczna.
    var gra = document.querySelector('[data-gra]');
    if (gra) {
        var ofrGra = gra.closest('.ofr');
        var komorki = Array.prototype.slice.call(gra.parentNode.querySelectorAll('.ofr__cell'));
        var cyfry = Array.prototype.slice.call(gra.querySelectorAll('[data-cyfra]'));
        var wynik = gra.querySelector('.ofr__wynik');
        var trybModal = /(^|[?&])gra=modal(&|$)/.test(location.search) && typeof HTMLDialogElement === 'function';
        var nazwaSciezki = function (cel) {
            var n = cel.querySelector('.ofr__label').textContent.trim();
            return n === 'Bezpłatnie' ? 'darmowy e-book' : n;
        };
        if (komorki.length === cyfry.length && !trybModal) {
            var los = komorki.slice();
            for (var i = los.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = los[i]; los[i] = los[j]; los[j] = t; }
            gra.hidden = false;
            cyfry.forEach(function (b, nr) {
                b.setAttribute('aria-pressed', 'false');
                b.addEventListener('click', function () {
                    var cel = los[nr];
                    var tytul = cel.querySelector('h3');
                    cyfry.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
                    komorki.forEach(function (k) { k.classList.toggle('is-picked', k === cel); });
                    wynik.textContent = 'Twoja cyfra ' + b.textContent + ' prowadzi do: ' + nazwaSciezki(cel) + '.';
                    tytul.setAttribute('tabindex', '-1');
                    cel.scrollIntoView({ block: 'start' });
                    tytul.focus({ preventScroll: true });
                });
            });
        }
        if (komorki.length === cyfry.length && trybModal) {
            ofrGra.classList.add('ofr--modal');
            gra.hidden = false;
            gra.querySelector('p').textContent = 'Wybierz cyfrę, która najbardziej Cię przyciąga. Pod każdą jest jedna ścieżka.';
            var okno = document.createElement('dialog');
            okno.className = 'ofr-okno';
            okno.setAttribute('aria-labelledby', 'ofr-okno-tytul');
            okno.innerHTML = '<div class="ofr-okno__gora"><p class="ofr-okno__cyfra" id="ofr-okno-tytul"></p><button type="button" class="ofr-okno__zamknij" aria-label="Zamknij okno"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="ofr-okno__tresc"></div><div class="ofr-okno__dol"><button type="button" class="btn btn--ghost btn--sm" data-inna>Wybierz inną cyfrę</button><button type="button" class="link-arrow ofr-okno__wszystkie" data-wszystkie>Pokaż wszystkie ścieżki</button></div>';
            document.body.appendChild(okno);
            var pokazWszystkie = document.createElement('button');
            pokazWszystkie.type = 'button';
            pokazWszystkie.className = 'link-arrow ofr__wszystkie';
            pokazWszystkie.textContent = 'Wolę zobaczyć wszystkie ścieżki';
            gra.appendChild(pokazWszystkie);
            var odslon = function (cel) {
                ofrGra.classList.remove('ofr--modal');
                pokazWszystkie.hidden = true;
                var doKogo = cel || komorki[0];
                var tytul = doKogo.querySelector('h3');
                tytul.setAttribute('tabindex', '-1');
                doKogo.scrollIntoView({ block: 'start' });
                tytul.focus({ preventScroll: true });
            };
            var ostatnia = null;
            var ostatniCel = null;
            cyfry.forEach(function (b, nr) {
                b.addEventListener('click', function () {
                    if (!ofrGra.classList.contains('ofr--modal')) {
                        komorki.forEach(function (k) { k.classList.toggle('is-picked', k === komorki[nr]); });
                        odslon(komorki[nr]);
                        return;
                    }
                    ostatnia = b;
                    ostatniCel = komorki[nr];
                    var kopia = ostatniCel.cloneNode(true);
                    kopia.removeAttribute('id');
                    kopia.removeAttribute('aria-labelledby');
                    kopia.classList.remove('is-picked');
                    Array.prototype.forEach.call(kopia.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); });
                    var numer = kopia.querySelector('.ofr__num');
                    if (numer) { numer.remove(); }
                    okno.querySelector('.ofr-okno__tresc').replaceChildren(kopia);
                    okno.querySelector('.ofr-okno__cyfra').textContent = 'Twoja cyfra ' + b.textContent + ': ' + nazwaSciezki(ostatniCel);
                    okno.showModal();
                });
            });
            okno.querySelector('.ofr-okno__zamknij').addEventListener('click', function () { okno.close(); });
            okno.querySelector('[data-inna]').addEventListener('click', function () { okno.close(); });
            okno.querySelector('[data-wszystkie]').addEventListener('click', function () { okno.close('wszystkie'); });
            okno.addEventListener('click', function (e) { if (e.target === okno) { okno.close(); } });
            okno.addEventListener('close', function () {
                if (okno.returnValue === 'wszystkie') { okno.returnValue = ''; odslon(ostatniCel); return; }
                if (ostatnia) { ostatnia.focus(); }
            });
            pokazWszystkie.addEventListener('click', function () { odslon(null); });
        }
    }

    // Strona produktu: pasek zakupu na telefonie chowa sie, gdy widac blok zakupu albo stopke
    var buybar = document.querySelector('[data-buybar]');
    if (buybar && 'IntersectionObserver' in window) {
        var widoczne = new Set();
        var cele = [document.querySelector(buybar.getAttribute('data-buybar')), document.querySelector('.site-footer')].filter(Boolean);
        var obs = new IntersectionObserver(function (wpisy) {
            wpisy.forEach(function (w) { if (w.isIntersecting) { widoczne.add(w.target); } else { widoczne.delete(w.target); } });
            buybar.classList.toggle('is-hidden', widoczne.size > 0);
        }, { threshold: 0 });
        cele.forEach(function (c) { obs.observe(c); });
    }

    // FAQ: animacja akordeonu (ten sam ruch co na danieljeziorski.pl: 520 ms, cubic-bezier(.22,.61,.36,1)).
    // Otwarte najwyżej jedno pytanie w grupie. Bez JS działa natywne <details name>.
    var ruchOk = function () { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
    var faq = Array.prototype.slice.call(document.querySelectorAll('.faq details, details[name]'));
    var stan = new Map();
    faq.forEach(function (d) {
        var grupa = d.getAttribute('name');
        if (grupa) { d.dataset.grupa = grupa; d.removeAttribute('name'); }
        stan.set(d, { ruch: null, cel: d.open });
    });
    var przelacz = function (d, otworz) {
        var s = stan.get(d);
        if (s.cel === otworz) { return; }
        s.cel = otworz;
        if (s.ruch) { var poprzedni = s.ruch; s.ruch = null; var od = d.getBoundingClientRect().height; poprzedni.cancel(); d.style.height = od + 'px'; }
        if (!ruchOk() || !d.animate) { d.open = otworz; d.style.height = ''; d.style.overflow = ''; return; }
        var start = d.getBoundingClientRect().height;
        d.style.height = 'auto';
        d.open = otworz;
        var koniec = d.getBoundingClientRect().height;
        d.open = true;
        d.classList.toggle('is-open', otworz);
        d.style.height = start + 'px';
        d.style.overflow = 'hidden';
        var r = d.animate([{ height: start + 'px' }, { height: koniec + 'px' }], { duration: 520, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
        s.ruch = r;
        r.onfinish = function () {
            if (s.ruch !== r) { return; }
            s.ruch = null;
            d.open = otworz;
            r.cancel();
            d.style.height = '';
            d.style.overflow = '';
        };
    };
    faq.forEach(function (d) {
        d.classList.toggle('is-open', d.open);
        var summary = d.querySelector('summary');
        if (!summary) { return; }
        summary.addEventListener('click', function (e) {
            e.preventDefault();
            var otworz = !stan.get(d).cel;
            if (otworz && d.dataset.grupa) {
                faq.forEach(function (o) { if (o !== d && o.dataset.grupa === d.dataset.grupa) { przelacz(o, false); } });
            }
            d.classList.toggle('is-open', otworz);
            przelacz(d, otworz);
        });
    });
})();
