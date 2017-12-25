// @flow

// type Data = Array<{ [key: string]: any }>;
//
// export default class DataTable {
//     parent: HTMLElement;
//     data: Data;
//
//     constructor(parent: HTMLElement) {
//         this.parent = parent;
//     }
//
//     build(data: Data) {
//
//     }
// };

type Data = Array<{ [key: string]: any }>;

export default class DataTable {
    parent: HTMLElement;
    data: Data;

    constructor(parent: HTMLElement) {
        this.parent = parent;

        const down_class = ' dir-down';
        const up_class = ' dir-up';

        let that = this;

        document.addEventListener('click', function (e) {
            let element = e.target;
            let cl = element.className;
            let dir = down_class;
            if (cl.indexOf(down_class) == -1) {
                cl = cl.replace(up_class, '') + down_class;
            } else {
                dir = up_class;
                cl = cl.replace(down_class, '') + up_class;
            }
            element.className = cl;

            let columnName = element.innerText;
            let sorted = that.sort(that.data, columnName);
            console.log('click');
            console.log(sorted);
            that.buildFromArray(sorted['data'], sorted['keys']);
        });
    }

    buildFromArray(data, keys) {
        this.data = data;
        let table = document.createElement('table');
        if (document.body) {
            document.body.appendChild(table);
        }
        table.style.marginTop = '20px';
        let tr = document.createElement('tr');
        table.appendChild(tr);
        table.id = "table";
        keys.forEach(function (key) {
            let th = document.createElement('th');
            tr.appendChild(th);
            th.innerText = key;
        });


        let values = [];
        data.forEach(function (row) {
            let tr = document.createElement('tr');
            table.appendChild(tr);
            row.forEach(function (item) {
                console.log(item);
                let td = document.createElement('td');
                tr.appendChild(td);
                td.innerText = item;
                values.push(item);
            });
        });
    }

    build(data: Data) {

        let sorted = this.sort(data, null, 10, 0);
        this.buildFromArray(sorted['data'], sorted['keys']);
    }

    sort(data: Data, sorted_by = null, display_count = 10, page_number = 0) {
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
            console.log('test');
            console.log(arr);
            let len = arr.length;
            console.log(len);
            let indices = new Array(len);
            for (let i = 0; i < len; ++i)
                indices[i] = i;
            indices.sort(function (a, b) {
                return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0;
            });
            return indices;
        }

        // read headers
        let data_headers = Object.keys(data[0]);
        // Object.keys["a", 2]
        // if Object.Typeof

        // paginate array
        data = data.slice(page_number*display_count, display_count);

        // set sorted by column name
        sorted_by = sorted_by || data_headers[0];
        let sorted_column_index = data_headers.indexOf(sorted_by);


        // fetch values to be displayed
        let data_arr = data.map(function (e, i) {
            return Object.values(data[i])
        });

        // console.log(data_arr);

        // transpose data matrix to get sortable data array
        let transposed_arr_2D = transpose(data_arr);


        // fetch indices order
        let indices = get_sorted_indices(transposed_arr_2D[sorted_column_index]);
        // console.log('click');
        // console.log(indices);


        // build sorted matrix by ordered indices
        let sorted_arr2D = [];
        transposed_arr_2D.forEach(function (row, i) {
            let sorted_row = [];
            for (i = 0; i < indices.length; i++) {
                sorted_row.push(row[indices[i]]);
            }
            sorted_arr2D.push(sorted_row);
        });

        console.log("Sorted 2D_arr:");
        console.table(sorted_arr2D);


        return {
            'data': transpose(sorted_arr2D),
            'keys': data_headers
        }
    }
};


