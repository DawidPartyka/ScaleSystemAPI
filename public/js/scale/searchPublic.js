import { searchScale } from "./search.js";

window.addEventListener('load', () => {
    document.getElementById('submitScaleSearch').addEventListener(
        'click',
        searchScale('/scale/search/')
    );
});