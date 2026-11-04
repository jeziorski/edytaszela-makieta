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
        var rest = document.querySelectorAll('.skip-link, .mock-bar, main, footer, .site-header__logo');
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

    // FAQ: otwarte najwyżej jedno pytanie w grupie (zapas dla przeglądarek bez <details name>)
    document.querySelectorAll('details[name]').forEach(function (d) {
        d.addEventListener('toggle', function () {
            if (!d.open) return;
            document.querySelectorAll('details[name="' + d.getAttribute('name') + '"]').forEach(function (o) {
                if (o !== d) o.open = false;
            });
        });
    });
})();
