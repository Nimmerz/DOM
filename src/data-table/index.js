// @flow

type Data = Array<{ [key: string]: any }>;

export default class DataTable {
    parent: HTMLElement;
    data: Data;
    data_values: Array<Array<Data>>;
    display_items_count: number;
    current_page_number: number;

    constructor(parent: HTMLElement) {
        this.parent = parent;
    }

    build(data: Data) {

        const context: Object = this;
        this.data_values = [];
        this.display_items_count = 10;
        this.current_page_number = 0;
        this.data = data;

        let keys = Object.keys(data[0]);
        let data_arr: Array<mixed> = data.map((e, i) => {
            return Object.values(data[i])
        });
        context.data_values = data_arr;

        const getDisplayItemsCount = () => {
            return context.display_items_count;
        };

        const getCurrentPageNumber = () => {
            return context.current_page_number;
        };

        const bind_table_headers = () => {
            for (let i = 0; i < this.parent.getElementsByTagName('th').length; i++) {
                let th: any = this.parent.getElementsByTagName('th')[i];
                th.addEventListener('click', (e) => {
                    let sortByColumnName = e.target.innerText;
                    let t: any = this.parent.getElementsByTagName('table')[0];
                    let prev_e_asc_state = e.target.getAttribute('asc');
                    prev_e_asc_state = (prev_e_asc_state == 'true') ? true : prev_e_asc_state ||
                    (prev_e_asc_state == 'false') ? false : prev_e_asc_state;

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
                            alert('Wrong value!!!!');
                    }

                    t.main_data = sort(t.main_data['data'], t.main_data['keys'], new_e_asc_state, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
                    t.setAttribute('sort_column_index', e.target.getAttribute('column_index'));
                    t.setAttribute('asc', new_e_asc_state);
                    e.target.setAttribute('asc', new_e_asc_state);
                    rebuild();
                });
            };
        };

        const rebuild = () => {
            let table: any = this.parent.getElementsByTagName('table')[0];
            table.innerText = '';
            table.setAttribute('style', 'margin-top: 20px; border-spacing: 0');
            let tr = document.createElement('tr');
            table.appendChild(tr);
            table.main_data['keys'].forEach((key, index) => {
                let th = document.createElement('th');
                th.innerText = key;
                if (index == table.getAttribute('sort_column_index')) {
                    th.setAttribute('asc', table.getAttribute('asc'));
                }
                th.setAttribute('column_index', index);
                tr.appendChild(th);
            });
            table.main_data['data'].forEach((data_row) => {
                let tr = document.createElement('tr');
                table.appendChild(tr);
                data_row.forEach((item) => {
                    let td = document.createElement('td');
                    tr.appendChild(td);
                    td.innerText = item;
                });

            });
            bind_table_headers();
        };

        const sort = (data_arr: Array<mixed>, data_headers, asc: ?boolean = true, sorted_by = null, display_count = 10, page_number = 0) => {
            const transpose = (array) => {
                let transposed = [],
                    row,
                    col;
                for (row = 0; row < array[0].length; row += 1) {
                    transposed[row] = [];
                    for (col = 0; col < array.length; col += 1) {
                        transposed[row][col] = array[col][row];
                    }
                }
                return transposed;
            };

            const get_sorted_indices = (arr) => {
                let len = arr.length;
                let indices = new Array(len);
                for (let i = 0; i < len; ++i)
                    indices[i] = i;
                indices.sort((a, b) => {
                    return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0;
                });
                return indices;
            };

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
            transposed_arr_2D.forEach((row, i) => {
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
        };

        let sorted = sort(data_arr, keys, true, null, getDisplayItemsCount(), getCurrentPageNumber());

        const buildFromArray = (data, keys) => {
            let table: any = document.createElement('table');
            table.main_data = {data: data, keys: keys};
            table.setAttribute('asc', true);
            this.parent.appendChild(table);
            rebuild();
        };

        buildFromArray(sorted['data'], sorted['keys']);
        const stringpages: Array<number> = [10, 20, 30, 50, 100, 300, 500, 800];
        let firstElement: number = 0;
        let numberOfViewElement: number = stringpages[0];


        const select = document.createElement('select');
        if (this.parent) this.parent.appendChild(select);
        select.style.margin = '20px';
        select.onchange = () => {
            numberOfViewElement = +select.value;
            firstElement = firstElement - (firstElement % +select.value);
            context.display_items_count = numberOfViewElement;
            let t: any = this.parent.getElementsByTagName('table')[0];
            let asc = t.getAttribute('asc');

            let sortByColumnName = t.getAttribute('sort_column_index') ?
                this.parent.getElementsByTagName('th')[t.getAttribute('sort_column_index')].innerText :
                this.parent.getElementsByTagName('th')[0].innerText;
            t.main_data = sort(t.main_data['data'], t.main_data['keys'], asc, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
            Paginations();
            rebuild();
        };
        const addSelectOption = (select: HTMLElement, value: number) => {
            let option = document.createElement('option');
            option.value = value.toString();
            option.innerText = value.toString();
            select.appendChild(option);
        };
        stringpages.forEach(item => addSelectOption(select, item));


        const Paginations = () => {
            let domButton = this.parent.querySelector('#paginationButtons');
            if (!!domButton) domButton.remove();
            let block = document.createElement('div');
            block.style.marginTop = '10px';
            block.style.float = 'right';
            if (this.parent) this.parent.appendChild(block);
            block.id = 'paginationButtons';

            const addButton = (parent: ?HTMLElement, value: number) => {
                const button = document.createElement('button');
                if (parent) parent.appendChild(button);
                button.innerText = (value).toString();
                button.value = (value).toString();
                button.style.margin = '0 5px';
                button.disabled = (value - 1) * numberOfViewElement <= firstElement &&
                    firstElement < value * numberOfViewElement;
                button.addEventListener('click', () => {
                    firstElement = numberOfViewElement * (value - 1);
                    context.current_page_number = value - 1;
                    Paginations();
                    let keys = Object.keys(data[0]);
                    let t: any = this.parent.getElementsByTagName('table')[0];
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
                        this.parent.getElementsByTagName('th')[t.getAttribute('sort_column_index')].innerText :
                        this.parent.getElementsByTagName('th')[0].innerText;
                    t.main_data = sort(data_arr, keys, asc, sortByColumnName, getDisplayItemsCount(), getCurrentPageNumber());
                    rebuild();
                });
            };
            const addDots = (dots) => {
                const dotsblock = document.createElement('span');
                if (dots) dots.appendChild(dotsblock);
                dotsblock.innerText = '...';
            };
            let pages: number = Math.ceil((this.data.length - 1) / numberOfViewElement);
            let numberPage: number = Math.ceil((firstElement - 1) / numberOfViewElement);
            addButton(block, 1);
            if (numberPage > 1) {
                if (numberPage > 2) addDots(block);
                addButton(block, numberPage);
            }
            if (numberPage > 0 && numberPage < pages - 1) {
                addButton(block, numberPage + 1);
            }
            if (numberPage < pages - 2) {
                addButton(block, numberPage + 2);
            }
            if (numberPage < pages - 3) {
                addButton(block, numberPage + 3);
            }
            if (pages > 1) addButton(block, pages);
        };
        Paginations();

    }
};


