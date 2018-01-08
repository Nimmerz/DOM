// @flow

type Data = Array<{ [key: string]: any }>;
export default class DataTable {
  parent: HTMLElement;
  data: Data;
  context: Object;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.context = {};
  }

  build(data: Data) {
    this.context = this;
    this.data_values = Object;
    this.data = data;

    let keys = Object.keys(data[0]);
    this.context.key_values = keys;
    this.context.data_values = data.map(function (e, i) { return Object.values(data[i]) });

    /************************************************************************/
    function getAsc() {
      let t = document.getElementsByTagName('table')[0];
      return t ? t.getAttribute('asc') : null;
    }
    function sort_laureate_data(asc = true, sorted_by = null, display_count = 10, page_number = 0) {
      function transpose(array) {
        let transposed = [], row, col;
        for (row = 0; row < array[0].length; row += 1) {
          transposed[row] = [];
          for (col = 0; col < array.length; col += 1) {
            transposed[row][col] = array[col][row];
          }
        }
        return transposed;
      }

      function get_sorted_indices(arr) {
        let len = arr.length;
        let indices = new Array(len);
        for (let i = 0; i < len; ++i) { indices[i] = i; }
        indices.sort(function (a, b) {
          return arr[a] < arr[b] ? -1 : arr[a] > arr[b] ? 1 : 0;
        });
        return indices;
      }

      debugger;
      if (getAsc() == null) return { 'data': this.context.data_values, 'keys': this.context.key_values }

      // set sorted by column name
      sorted_by = sorted_by || data_headers[0];
      let sorted_column_index = data_headers.indexOf(sorted_by);

      // transpose data matrix to get sortable data array
      let transposed_arr_2D = transpose(this.context.data_values);

      // fetch indices order
      let indices = get_sorted_indices(transposed_arr_2D[sorted_column_index]);
      if (!getAsc()) {
        debugger;
        indices = indices.reverse();
      }
      let from = page_number * display_count;
      let to = page_number * display_count + display_count - 1;
      debugger;
      indices = indices.slice(from, to);

      //data_arr = context.data_values.slice(from, to);
      //data_arr = asc == false ? data_arr.reverse() : data_arr;


      // build sorted matrix by ordered indices
      let sorted_arr2D = [];
      transposed_arr_2D.forEach(function (row, i) {
        let sorted_row = [];
        for (i = 0; i < indices.length; i++) {
          sorted_row.push(row[indices[i]]);
        }
        sorted_arr2D.push(sorted_row);
      });
      return { 'data': transpose(sorted_arr2D), 'keys': data_headers }
    }
    function buildFromArray(data, keys) {
      let table = document.createElement('table');
      table.main_data = {data: data, keys: keys};
      table.setAttribute('asc', true);
      document.body.appendChild(table);
      rebuild();
    }
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
              new_e_asc_state = true; break;
            case true:
              new_e_asc_state = false; break;
            case false:
              new_e_asc_state = true; break;
            default:
              alert('Wrong value!!!!');
          }
          // paginate array
          t.main_data = sort_laureate_data(new_e_asc_state, sortByColumnName);
          t.setAttribute('sort_column_index', e.target.getAttribute('column_index'));
          t.setAttribute('asc', new_e_asc_state);
          e.target.setAttribute('asc', new_e_asc_state);
          rebuild();
        });
      }
      ;
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
          th.setAttribute('asc', getAsc());
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

    let sorted = sort_laureate_data(true, null);
    buildFromArray(sorted['data'], sorted['keys']);
    /*************************************************************************/
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
          viewPaginationButton();
          let keys = Object.keys(data[0]);
          let t = document.getElementsByTagName('table')[0];
          let asc = getAsc();
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
          /* USAGE OF data_arr VARIABLE IS DANGEROUS! */
          t.main_data = sort_laureate_data(asc, sortByColumnName);
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
    function select(): void {
      const select = document.createElement('select');
      if (document.body) document.body.appendChild(select);
      select.style.margin = '20px';
      select.onchange = (): void => {
        numberOfViewElement = +select.value;
        firstElement = firstElement - (firstElement % +select.value);
        let t = document.getElementsByTagName('table')[0];
        let asc = t.getAttribute('asc');

        let sortByColumnName = t.getAttribute('sort_column_index') ?
          document.getElementsByTagName('th')[t.getAttribute('sort_column_index')].innerText :
          document.getElementsByTagName('th')[0].innerText;
        t.main_data = sort_laureate_data(asc, sortByColumnName);
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

    const stringPages: Array<number> = [10, 20, 30, 50, 100, 300, 500, 1000];
    let firstElement: number = 0;
    let numberOfViewElement: number = stringPages[0];

    select();
    viewPaginationButton();
  }
};
