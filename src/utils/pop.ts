

export function getUrlParams(key:string) {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	return urlParams.get(key);
}

export function getProjectAccount() {
	const pathString = window.location.pathname;
	return pathString.replace("/cloud/","");
}