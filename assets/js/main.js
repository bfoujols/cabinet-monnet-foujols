/* Cabinet Monnet & Foujols : scripts du site statique (sans jQuery).
   - menu mobile Oxygen
   - visionneuse de la galerie « Notre cabinet »
   - bandeau de consentement cookies + chargement conditionnel de Google Analytics */
(function () {
	'use strict';

	var GA_IDS = ['G-VLQXP77G83', 'GT-TNP9GNK'];
	var CONSENT_COOKIE = 'mf_consent';
	var CONSENT_DAYS = 180; // recommandation CNIL : 6 mois
	var CATEGORIES = ['functional', 'performance', 'analytics', 'advertisement', 'others'];

	/* ------------------------------------------------------------ menu mobile */
	function closeMenus() {
		document.querySelectorAll('.oxy-nav-menu-open').forEach(function (m) {
			m.classList.remove('oxy-nav-menu-open');
		});
		document.body.classList.remove('oxy-nav-menu-prevent-overflow');
		document.documentElement.classList.remove('oxy-nav-menu-prevent-overflow');
	}

	document.addEventListener('click', function (e) {
		var toggle = e.target.closest('.oxy-menu-toggle');
		if (toggle) {
			var menu = toggle.parentElement;
			if (menu && menu.classList.contains('oxy-nav-menu')) {
				menu.classList.toggle('oxy-nav-menu-open');
				document.body.classList.toggle('oxy-nav-menu-prevent-overflow');
				document.documentElement.classList.toggle('oxy-nav-menu-prevent-overflow');
			}
			return;
		}
		var anchor = e.target.closest('.oxy-nav-menu-open .menu-item a[href*="#"]');
		if (anchor) closeMenus();
	});

	/* ------------------------------------------------------------- galerie */
	function initGalleries() {
		var galleries = document.querySelectorAll('.oxy-gallery');
		if (!galleries.length) return;

		var box = document.createElement('div');
		box.className = 'mf-lightbox';
		box.setAttribute('role', 'dialog');
		box.setAttribute('aria-modal', 'true');
		box.setAttribute('aria-label', 'Galerie photo');
		box.innerHTML =
			'<span class="mf-lb-count"></span>' +
			'<img alt="">' +
			'<button type="button" class="mf-lb-close" aria-label="Fermer">&times;</button>' +
			'<button type="button" class="mf-lb-prev" aria-label="Photo précédente">&lsaquo;</button>' +
			'<button type="button" class="mf-lb-next" aria-label="Photo suivante">&rsaquo;</button>';
		document.body.appendChild(box);

		var img = box.querySelector('img');
		var count = box.querySelector('.mf-lb-count');
		var items = [];
		var index = 0;
		var lastFocus = null;

		function show(i) {
			index = (i + items.length) % items.length;
			img.src = items[index].href;
			img.alt = (items[index].querySelector('img') || {}).alt || '';
			count.textContent = (index + 1) + ' / ' + items.length;
			box.querySelector('.mf-lb-prev').hidden = box.querySelector('.mf-lb-next').hidden = items.length < 2;
		}
		function open(list, i) {
			items = list;
			lastFocus = document.activeElement;
			show(i);
			box.classList.add('is-open');
			box.querySelector('.mf-lb-close').focus();
		}
		function close() {
			box.classList.remove('is-open');
			img.removeAttribute('src');
			if (lastFocus) lastFocus.focus();
		}

		galleries.forEach(function (g) {
			var links = Array.prototype.slice.call(g.querySelectorAll('a.oxy-gallery-item'));
			links.forEach(function (a, i) {
				a.addEventListener('click', function (e) {
					e.preventDefault();
					open(links, i);
				});
			});
		});
		box.addEventListener('click', function (e) {
			if (e.target.closest('.mf-lb-prev')) show(index - 1);
			else if (e.target.closest('.mf-lb-next')) show(index + 1);
			else if (e.target === box || e.target.closest('.mf-lb-close')) close();
		});
		document.addEventListener('keydown', function (e) {
			if (!box.classList.contains('is-open')) return;
			if (e.key === 'Escape') close();
			else if (e.key === 'ArrowLeft') show(index - 1);
			else if (e.key === 'ArrowRight') show(index + 1);
		});
	}

	/* ------------------------------------------------------------- cookies */
	function readConsent() {
		var m = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
		if (!m) return null;
		var accepted = decodeURIComponent(m[1]).split(',');
		var consent = {};
		CATEGORIES.forEach(function (c) { consent[c] = accepted.indexOf(c) !== -1; });
		return consent;
	}

	function writeConsent(consent) {
		var accepted = CATEGORIES.filter(function (c) { return consent[c]; });
		var expires = new Date(Date.now() + CONSENT_DAYS * 864e5).toUTCString();
		document.cookie = CONSENT_COOKIE + '=' + encodeURIComponent(accepted.join(',') || 'necessary') +
			'; expires=' + expires + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
	}

	var gaLoaded = false;
	function loadAnalytics() {
		if (gaLoaded) return;
		gaLoaded = true;
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () { window.dataLayer.push(arguments); };
		window.gtag('js', new Date());
		GA_IDS.forEach(function (id) { window.gtag('config', id); });
		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_IDS[0];
		document.head.appendChild(s);
	}

	function applyConsent(consent) {
		if (consent && consent.analytics) loadAnalytics();
	}

	function initCookies() {
		var bar = document.getElementById('cookie-law-info-bar');
		var modal = document.getElementById('cliSettingsPopup');
		var overlay = document.querySelector('.cli-settings-overlay');
		if (!bar || !modal) return;

		var consent = readConsent();
		if (consent) applyConsent(consent);
		else bar.classList.add('is-visible');

		function syncCheckboxes() {
			var current = readConsent() || {};
			CATEGORIES.forEach(function (c) {
				var box = document.getElementById('wt-cli-checkbox-' + c);
				if (box) box.checked = !!current[c];
			});
		}
		function openModal() {
			syncCheckboxes();
			modal.classList.remove('cli-out');
			modal.classList.add('cli-show', 'cli-blowup');
			modal.setAttribute('aria-hidden', 'false');
			document.body.classList.add('cli-modal-open');
			if (overlay) overlay.classList.add('cli-show');
			modal.focus();
		}
		function closeModal() {
			modal.classList.remove('cli-show', 'cli-blowup');
			modal.classList.add('cli-out');
			modal.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('cli-modal-open');
			if (overlay) overlay.classList.remove('cli-show');
		}
		function save(next) {
			writeConsent(next);
			bar.classList.remove('is-visible');
			closeModal();
			applyConsent(next);
		}

		document.addEventListener('click', function (e) {
			if (e.target.closest('.cli_settings_button, a[href="#cookie-settings"]')) {
				e.preventDefault();
				openModal();
			} else if (e.target.closest('#wt-cli-accept-all-btn')) {
				e.preventDefault();
				var all = {};
				CATEGORIES.forEach(function (c) { all[c] = true; });
				save(all);
			} else if (e.target.closest('#wt-cli-privacy-save-btn')) {
				e.preventDefault();
				var chosen = {};
				CATEGORIES.forEach(function (c) {
					var box = document.getElementById('wt-cli-checkbox-' + c);
					chosen[c] = !!(box && box.checked);
				});
				save(chosen);
			} else if (e.target.closest('#cliModalClose') || e.target === modal) {
				closeModal();
			}
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && modal.classList.contains('cli-show')) closeModal();
		});

		// Volets dépliables de chaque catégorie
		modal.querySelectorAll('.cli-tab-header').forEach(function (header) {
			header.addEventListener('click', function (e) {
				if (e.target.closest('input, label')) return;
				var wasActive = header.classList.contains('cli-tab-active');
				modal.querySelectorAll('.cli-tab-header').forEach(function (h) {
					h.classList.remove('cli-tab-active');
					var c = h.parentElement.querySelector('.cli-tab-content');
					if (c) c.style.display = 'none';
				});
				if (!wasActive) {
					header.classList.add('cli-tab-active');
					var content = header.parentElement.querySelector('.cli-tab-content');
					if (content) {
						content.style.display = 'block';
						var pane = content.querySelector('.cli-tab-pane');
						if (pane) pane.style.display = 'block';
					}
				}
			});
		});

		// « Afficher plus / moins » du texte d'introduction
		var text = modal.querySelector('.cli-privacy-content-text');
		var more = modal.querySelector('.cli-privacy-readmore');
		var overview = modal.querySelector('.cli-privacy-overview');
		if (text && more && overview) {
			var full = text.innerHTML;
			var plain = text.textContent.trim();
			if (plain.length > 250) {
				var truncate = function () { text.textContent = plain.substring(0, 250) + '...'; };
				truncate();
				more.addEventListener('click', function (e) {
					e.preventDefault();
					if (overview.classList.contains('cli-collapsed')) {
						overview.classList.remove('cli-collapsed');
						truncate();
					} else {
						overview.classList.add('cli-collapsed');
						text.innerHTML = full;
					}
				});
			} else {
				more.style.display = 'none';
			}
		}
	}

	function init() {
		initGalleries();
		initCookies();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
