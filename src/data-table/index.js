// @flow

type Data = Array<{ [key: string]: any }>;
export default class DataTable {
    parent: HTMLElement;
    data: Data;
    data_values: Array<Array<Data>>;
    tablebody: HTMLElement;
    selectblock: HTMLElement;

    constructor(parent: HTMLElement) {
        this.parent = parent;
    }

    build(data: Data) {
        let this_context = null;
        this_context = this;
        this.data_values = Object;
        this.data = data;
        let keys = Object.keys(data[0]);
        this_context.key_values = keys;
        this.tablebody = document.createElement('div');
        this.selectblock = document.createElement('div');
        this.parent.appendChild(this.tablebody);
        this.parent.appendChild(this.selectblock);

        data = data.map((person) => {
            let person_full_hash = {};
            keys.forEach((key) => {
                let pair = {};
                pair[key] = person[key];
                person_full_hash = Object.assign(person_full_hash, pair);
            });
            return person_full_hash;
        });

        this_context.data_values = data.map((e, i) => {
            return Object.values(data[i])
        });

        const stringPages: Array<number> = [10, 20, 30, 50, 100, 300, 500, 800];
        let firstElement: number = 0;
        let numberOfElements: number = stringPages[0];
        let currentPageNumber: number = 0;
        let sortByColumnName = this_context.key_values[0];

        const getAsc = () => {
            let t = this.tablebody.getElementsByTagName('table')[0];
            if (t == null) {
                return null;
            }
            let asc = t.getAttribute('asc');
            return asc == "true" ? true : asc == "false" ? false : null;
        };

        const sort_laureate_data = (asc = getAsc()) => {
            const transpose = (array) => {
                let transposed = [], row, col;
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
                for (let i = 0; i < len; ++i) {
                    indices[i] = i;
                }
                indices.sort((a, b) => {
                    return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0;
                });
                return indices;
            };


            let page_number = currentPageNumber;
            let from = page_number * numberOfElements;
            let to = numberOfElements * (page_number + 1) - 1;

            if (getAsc() == null) {
                return {'data': this_context.data_values.slice(from, to), 'keys': this_context.key_values}
            }

            // set sorted by column name
            let sorted_column_index = this_context.key_values.indexOf(sortByColumnName);
            // transpose data matrix to get sortable data array
            let transposed_arr_2D = transpose(this_context.data_values);
            // fetch indices order
            let indices = get_sorted_indices(transposed_arr_2D[sorted_column_index]);
            if (!getAsc()) {
                indices = indices.reverse();
            }

            indices = indices.slice(from, to);

            // build sorted matrix by ordered indices
            let sorted_arr2D = [];
            transposed_arr_2D.forEach((row, i) => {
                let sorted_row = [];
                for (i = 0; i < indices.length; i++) {
                    sorted_row.push(row[indices[i]]);
                }
                sorted_arr2D.push(sorted_row);
            });
            return {'data': transpose(sorted_arr2D), 'keys': this_context.key_values}
        };

        const buildFromArray = (data, keys) => {
            let table: any = document.createElement('table');
            table.main_data = {data: data, keys: keys};
            table.setAttribute('asc', true);
            this.tablebody.appendChild(table);
            rebuild();
        };

        const bind_table_headers = () => {
            for (let i = 0; i < this.tablebody.getElementsByTagName('th').length; i++) {
                let th: any = this.tablebody.getElementsByTagName('th')[i];
                th.addEventListener('click', (e) => {
                    let t: any = this.tablebody.getElementsByTagName('table')[0];
                    let prev_e_asc_state = e.target.getAttribute('asc');
                    prev_e_asc_state = (prev_e_asc_state == 'true') ? true : prev_e_asc_state;
                    prev_e_asc_state = (prev_e_asc_state == 'false') ? false : prev_e_asc_state;
                    let new_e_asc_state = !prev_e_asc_state;
                    t.setAttribute('asc', new_e_asc_state);
                    // paginate array
                    t.main_data = sort_laureate_data(new_e_asc_state);
                    t.setAttribute('sort_column_index', e.target.getAttribute('column_index'));
                    t.setAttribute('asc', new_e_asc_state);
                    e.target.setAttribute('asc', new_e_asc_state);
                    rebuild();
                });
            };
        };


        const rebuild = () => {
            let table: any = this.tablebody.getElementsByTagName('table')[0];
            this.tablebody.appendChild(table);
            table.innerText = '';
            table.setAttribute('style', 'margin-top: 20px; border-spacing: 0');
            let tr = document.createElement('tr');
            table.appendChild(tr);
            table.main_data['keys'].forEach((key, index) => {
                let th = document.createElement('th');
                th.innerText = key;
                if (index == table.getAttribute('sort_column_index')) {
                    th.setAttribute('asc', getAsc());
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
                    if (typeof item != 'undefined') {
                        td.innerText = item;
                    };
                });

            });
            bind_table_headers();
        };

        let sorted = sort_laureate_data();
        buildFromArray(sorted['data'], sorted['keys']);

        const select = document.createElement('select');
        if (this.selectblock) this.selectblock.appendChild(select);
        select.style.margin = '20px';
        select.onchange = () => {
            numberOfElements = +select.value;
            firstElement = firstElement - (firstElement % +select.value);
            let t = this.tablebody.getElementsByTagName('table')[0];
            let asc = t.getAttribute('asc');
            t.main_data = sort_laureate_data(asc);
            Paginations();
            rebuild();
        };
        const addSelect = (select: HTMLElement, value: number) => {
            let selectOption = document.createElement('option');
            selectOption.value = value.toString();
            selectOption.innerText = value.toString();
            select.appendChild(selectOption);
        };
        stringPages.forEach(item => addSelect(select, item));

        const addDots = (dots): void => {
            const ellipsis = document.createElement('span');
            if (dots) dots.appendChild(ellipsis);
            ellipsis.innerText = '...';
        };

        const Paginations = () => {
            let domButton = this.selectblock.querySelector('#buttons');
            if (!!domButton) domButton.remove();
            let block = document.createElement('div');
            block.style.marginTop = '15px';
            block.style.float = 'right';
            if (this.selectblock) this.selectblock.appendChild(block);
            block.id = 'buttons';
            const addButtons = (parent: ?HTMLElement, value: number) => {
                const button = document.createElement('button');
                if (parent) parent.appendChild(button);
                button.innerText = (value).toString();
                button.value = (value).toString();
                button.style.margin = '0 8px';
                button.disabled = (value - 1) * numberOfElements <= firstElement &&
                    firstElement < value * numberOfElements;
                button.addEventListener('click', () => {
                    currentPageNumber = value - 1;
                    firstElement = numberOfElements * currentPageNumber;
                    Paginations();
                    let t = this.tablebody.getElementsByTagName('table')[0];
                    t.main_data = sort_laureate_data(getAsc());
                    rebuild();
                });
            };
            let pages: number = Math.ceil((this.data.length - 1) / numberOfElements);
            let numberPage: number = Math.ceil((firstElement - 1) / numberOfElements);
            if (numberPage > pages) numberPage = pages;
            addButtons(block, 1);
            if (numberPage > 1) {
                if (numberPage > 2) addDots(block);
                addButtons(block, numberPage);
            }
            if (numberPage > 0 && numberPage < pages - 1) {
                addButtons(block, numberPage + 1);
            }
            if (numberPage < pages - 2) {
                addButtons(block, numberPage + 2);
            }
            if (numberPage < pages - 3) {
                addButtons(block, numberPage + 3);
                if (numberPage < pages - 3) addDots(block);
            }
            if (pages > 1) addButtons(block, pages);
        };
        Paginations();
    };
};
