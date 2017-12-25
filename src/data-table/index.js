// @flow

type Data = Array<{ [key: string]: any }>;
export default class DataTable {
    parent: HTMLElement;
    data: Data;


    constructor(parent: HTMLElement) {
        this.parent = parent;
    }

    build(data: Data) {
        const context = this;
        this.data_values = Object;
        this.display_items_count = 10;
        this.current_page_number = 0;

        this.data = data;

        let keys = Object.keys(data[0]);
        let data_arr = data.map(function (e, i) {
            return Object.values(data[i])
        });
        context.data_values = data_arr;

        // paginate array
        function getDisplayItemsCount() {
            return context.display_items_count;
        }

        function getCurrentPageNumber() {
            console.log("---------------");
            console.log(context.current_page_number.toString());
            console.log("Inspect value of : context.current_page_number ----------------------");
            return context.current_page_number;
        }

        let sorted = sort(data_arr, keys, true, null, getDisplayItemsCount(), getCurrentPageNumber());

        function bind_table_headers() {
            for (let i = 0; i < document.getElementsByTagName('th').length; i++) {
                let th = document.getElementsByTagName('th')[i];
                th.addEventListener('click', function (e) {
                    let sortByColumnName = e.target.innerText;
                    let t = document.getElementsByTagName('table')[0];

                    let prev_e_asc_state = e.target.getAttribute('asc');
                    prev_e_asc_state = (prev_e_asc_state == 'true') ? true : prev_e_asc_state;
                    prev_e_asc_state = (prev_e_asc_state == 'false') ? false : prev_e_asc_state;

                    let new_e_asc_state;
                    switch (prev_e_asc_state) {
                        case null:
                            new_e_asc_state = true;
                            break;
                        case true:
                            new_e_asc_state = false;
                            break;
                        case false:
                            new_e_asc_state = true;
                            break;
                        default:
                            alert( 'Wrong value!!!!' );
                    }
                    // paginate array
                    t.main_data = sort(t.main_data['data'], t.main_data['keys'], new_e_asc_state, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
                    t.setAttribute('sort_column_index', e.target.getAttribute('column_index'));
                    t.setAttribute('asc', new_e_asc_state);
                    e.target.setAttribute('asc', new_e_asc_state);
                    rebuild();
                });
            };
        }

        function rebuild() {
            let table = document.getElementsByTagName('table')[0];
            table.innerText = '';
            table.setAttribute('style', 'margin-top: 20px; border-spacing: 0');
            let tr = document.createElement('tr');
            table.appendChild(tr);
            table.main_data['keys'].forEach(function (key, index) {
                let th = document.createElement('th');
                th.innerText = key;
                if (index == table.getAttribute('sort_column_index')) {
                    th.setAttribute('asc', table.getAttribute('asc'));
                }
                th.setAttribute('column_index', index);
                tr.appendChild(th);
            });
            table.main_data['data'].forEach(function (data_row) {
                let tr = document.createElement('tr');
                table.appendChild(tr);
                data_row.forEach(function (item) {
                    let td = document.createElement('td');
                    tr.appendChild(td);
                    td.innerText = item;
                });

            });
            bind_table_headers();
        }

        function sort(data_arr, data_headers, asc = true, sorted_by = null, display_count = 10, page_number = 0) {
            function transpose(array) {
                let transposed = [],
                    row,
                    col;
                for (row = 0; row < array[0].length; row += 1) {
                    transposed[row] = [];
                    for (col = 0; col < array.length; col += 1) {
                        transposed[row][col] = array[col][row];
                    }
                };
                return transposed;
            }

            function get_sorted_indices(arr) {
                let len = arr.length;
                let indices = new Array(len);
                for (let i = 0; i < len; ++i)
                    indices[i] = i;
                indices.sort(function (a, b) {
                    return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0;
                });
                return indices;
            }

            let from = page_number * display_count;
            let to = page_number * display_count + display_count - 1;
            data_arr = context.data_values.slice(from, to);
            data_arr = asc == false ? data_arr.reverse() : data_arr;
            // paginate array

            if (asc == null) {
                return {
                    'data': data_arr,
                    'keys': data_headers
                }
            }

            // set sorted by column name
            sorted_by = sorted_by || data_headers[0];
            let sorted_column_index = data_headers.indexOf(sorted_by);

            // transpose data matrix to get sortable data array
            let transposed_arr_2D = transpose(data_arr);

            // fetch indices order
            let indices = get_sorted_indices(transposed_arr_2D[sorted_column_index]);
            if (!asc) indices = indices.reverse();

            // build sorted matrix by ordered indices
            let sorted_arr2D = [];
            transposed_arr_2D.forEach(function (row, i) {
                let sorted_row = [];
                for (i = 0; i < indices.length; i++) {
                    sorted_row.push(row[indices[i]]);
                }
                sorted_arr2D.push(sorted_row);
            });

            return {
                'data': transpose(sorted_arr2D),
                'keys': data_headers
            }
        }

        function buildFromArray(data, keys) {
            let table = document.createElement('table');
            table.main_data = {data: data, keys: keys};
            table.setAttribute('asc', true);
            document.body.appendChild(table);
            rebuild();
        }



        buildFromArray(sorted['data'], sorted['keys']);


        const stringPages: Array<number> = [10, 20, 30, 50, 100, 300, 500, 1000];
        let firstElement: number = 0;
        let numberOfViewElement: number = stringPages[0];


        function select(): void {
            const select = document.createElement('select');
            if (document.body) document.body.appendChild(select);
            select.style.margin = '20px';
            select.onchange = (): void => {
                numberOfViewElement = +select.value;
                firstElement = firstElement - (firstElement % +select.value);
                context.display_items_count = numberOfViewElement;
                let t = document.getElementsByTagName('table')[0];
                let asc = t.getAttribute('asc');

                let sortByColumnName = t.getAttribute('sort_column_index') ?
                    document.getElementsByTagName('th')[t.getAttribute('sort_column_index')].innerText :
                    document.getElementsByTagName('th')[0].innerText;
                t.main_data = sort(t.main_data['data'], t.main_data['keys'], asc, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
                rebuild();
            };
            const addSelectOption = (select: HTMLElement, value: number) => {
                let option = document.createElement('option');
                option.value = value.toString();
                option.innerText = value.toString();
                select.appendChild(option);
            };
            stringPages.forEach(item => addSelectOption(select, item));
        };
        select();


        const viewPaginationButton = (): void => {
            let buttonsInDOM = document.getElementById('paginationButtons');
            buttonsInDOM && buttonsInDOM.remove();
            let section = document.createElement('section');
            section.style.marginTop = '10px';
            section.style.float = 'right';
            if (document.body) document.body.appendChild(section);
            section.id = 'paginationButtons';

            const addButton = (parent: ?HTMLElement, value: number): void => {
                const button = document.createElement('button');
                if (parent) parent.appendChild(button);
                button.innerText = (value).toString();
                button.value = (value).toString();
                button.style.margin = '0 5px';
                button.disabled = (value - 1) * numberOfViewElement <= firstElement &&
                    firstElement < value * numberOfViewElement;
                button.addEventListener('click', () => {
                    firstElement = numberOfViewElement * (value - 1);
                context.current_page_number = value;
                viewPaginationButton();
                let keys = Object.keys(data[0]);
                let t = document.getElementsByTagName('table')[0];
                let asc = t.getAttribute('asc');
                switch (asc) {
                    case 'true':
                        asc = true;
                    break;
                    case 'false':
                        asc = false;
                    break;
                    default:
                        asc = null;
                }
                let sortByColumnName = t.getAttribute('sort_column_index') ?
                    document.getElementsByTagName('th')[t.getAttribute('sort_column_index')].innerText :
                    document.getElementsByTagName('th')[0].innerText;
                t.main_data = sort(data_arr, keys, asc, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
                rebuild();
                });
            };

            const addDots = (dots): void => {
                const ellipsis = document.createElement('span');
                if (dots) dots.appendChild(ellipsis);
                ellipsis.innerText = '...';
            };

            let numberOfPages: number = Math.ceil((this.data.length - 1) / numberOfViewElement);
            let numberOfViewPage: number = Math.ceil((firstElement - 1) / numberOfViewElement);
            addButton(section, 1);
            if (numberOfViewPage > 1) {
                if (numberOfViewPage > 2) addDots(section);
                addButton(section, numberOfViewPage);
            }
            if (numberOfViewPage > 0 && numberOfViewPage < numberOfPages - 1) {
                addButton(section, numberOfViewPage + 1);
            }
            if (numberOfViewPage < numberOfPages - 2) {
                addButton(section, numberOfViewPage + 2);
                if (numberOfViewPage < numberOfPages - 3) addDots(section);
            }
            if (numberOfPages > 1) addButton(section, numberOfPages);
        };
        viewPaginationButton();


    }
};


