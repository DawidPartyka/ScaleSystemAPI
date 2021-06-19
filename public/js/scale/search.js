import { createDomElement } from "../utils/utils.js";

export const searchScale = (searchUrl) => {
    return async (event) => {
        event.preventDefault();

        const search = document.getElementById('scaleSearchInput').value;

        if(!search){
            alert('Fill search phrase before sending');

            return;
        }

        const rawResponse = await fetch(searchUrl + search);

        const response = await rawResponse;
        const jsonResponse = await response.json();

        if(response.status !== 200){
            let msg = 'Sorry. Something went wrong';

            if(response.status === 404)
                msg += '\nNo scale matches your phrase';

            msg += `\nStatus: ${response.status}`;

            alert(msg);

            document.getElementById('scaleSearch').reset();

            return;
        }

        const list = document.getElementById('scalesList');
        list.innerHTML = "";

        const createCol = () => createDomElement('div', ['col']);
        const createInfoCol = (title, value) => {
            const col = createCol();
            col.appendChild(createDomElement('p', ['text-info'], `${title}: ${value}`));
            return col;
        }

        jsonResponse.response.forEach((entry) => {
            const li = createDomElement('li', ['list-group-item']);
            const row = createDomElement('div', ['row']);

            const col1 = createInfoCol('Name', entry.name);
            row.appendChild(col1);

            const col2 = createInfoCol('Tonic', entry.tonic);
            row.appendChild(col2);

            const col3 = createInfoCol('Created at', entry.createdAt);
            row.appendChild(col3);

            const href = createDomElement('a');
            href.setAttribute('href', 'https://localhost:8000/user/showScale/' + entry.id);
            const button = createDomElement('button', ['btn', 'btn-primary'], 'Show');
            href.appendChild(button);

            const col4 = createCol();
            col4.appendChild(href);
            row.appendChild(col4);

            li.appendChild(row);
            list.appendChild(li);
        });
    }
}