(function () {
	const savedTheme = localStorage.getItem('app-theme');
	if (savedTheme === 'dark' || savedTheme === 'light') {
		document.documentElement.setAttribute('data-theme', savedTheme);
	} else {
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
	}
})();
