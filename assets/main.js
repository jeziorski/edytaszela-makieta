// Makieta edytaszela.pl: menu mobilne i formularz poglądowy (bez wysyłki danych)
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('nav');

    if (toggle && nav) {
        var setOpen = function (open) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
            nav.classList.toggle('is-open', open);
            document.body.classList.toggle('menu-open', open);
        };
        toggle.addEventListener('click', function () {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 880) setOpen(false);
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
    // Makieta: przełącznik wariantów kolorów (A obecny, B jasne tło, C jasne tło i rdzawy akcent)
    (function () {
        var root = document.documentElement;
        var q = new URLSearchParams(location.search).get('wariant');
        var saved = null;
        try { saved = localStorage.getItem('wariant'); } catch (e) {}
        var current = q || saved || 'a';
        function apply(v) {
            current = v;
            if (v === 'a') { root.removeAttribute('data-wariant'); } else { root.setAttribute('data-wariant', v); }
            try { localStorage.setItem('wariant', v); } catch (e) {}
            bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.value === v)); });
        }
        var bar = document.createElement('div');
        bar.className = 'wariant-switch';
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', 'Wariant kolorów makiety');
        bar.innerHTML = '<span>Wariant kolorów:</span><button type="button" value="a">A</button><button type="button" value="b">B</button><button type="button" value="c">C</button>';
        bar.addEventListener('click', function (e) { if (e.target.value) { apply(e.target.value); } });
        document.body.appendChild(bar);
        document.body.classList.add('has-wariant-switch');
        apply(current);
    })();
})();
