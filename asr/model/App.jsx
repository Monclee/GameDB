var React = require('react');
var Header = require('./Header.jsx');
var FixedDataTable = require('fixed-data-table');
var _ = require('underscore');
var moment = require ('moment');
var Path = require('object-path');

var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC'
};

var App = React.createClass({
  getInitialState() {
    var props = window.props;
    props.width = 825 - 60;

    var columns = props.columns;
    var rows = props.rows;

    if (rows.length && !Array.isArray(rows[0])) {
      var _rows = [];
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var _row = [];
        for (var i = 0; i < columns.length; i++) {
          var name = columns[i].split(':');
          if (name.length > 1) {
            _row.push(_.pluck(row[name[0]], name[1]).join('; '));
          } else if (name[0].indexOf('.') > -1) {
            try {
              _row.push(Path.get(row, name[0]));
            } catch (e) {
              console.error(e);
              console.log(row);
            }
          } else {
            _row.push(row[name[0]]);
          }
        }
        _rows.push(_row);
      }

      props.rows = _rows;
    }


    return props;
  },
  _updateTableWidth: function () {
    var node = React.findDOMNode(this.refs.tableBox);
    var currWidth = node.offsetWidth - 60;
    if (currWidth !== this.state.width) {
      this.setState({width: node.offsetWidth - 60});
    }
  },
  componentDidMount() {
    var self = this;

    document.title = this.state.title;

    this._updateTableWidth();

    window.onresize = function () {
      self._updateTableWidth();
    }
  },
  _headerRenderer: function (label, cellDataKey) {
    return <div style={{color:'#fff',cursor:'pointer'}} onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</div>
  },
  _sortRowsBy(cellDataKey) {
    var sortDir = this.state.sortDir;
    var sortBy = cellDataKey;
    if (sortBy === this.state.sortBy) {
      sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
    } else {
      sortDir = SortTypes.DESC;
    }

    var rows = this.state.rows.slice();
    rows.sort((a, b) => {
      var sortVal = 0;
      if (a[sortBy] > b[sortBy]) {
        sortVal = 1;
      }
      if (a[sortBy] < b[sortBy]) {
        sortVal = -1;
      }

      if (sortDir === SortTypes.DESC) {
        sortVal = sortVal * -1;
      }

      return sortVal;
    });

    this.setState({
      rows,
      sortBy,
      sortDir
    });
  },
  _cellRenderer(data, column, row){
    if (column > 1)
      return <div
        style={{whiteSpace: 'nowrap', opacity: column > 1 ? 0.5 : 1, textOverflow: 'ellipsis', overflow: 'hidden', width: 250}}>{typeof data === 'string' && data.length > 50 ? data.substring(0, 50) : (this.state.columns[column].indexOf('date') > -1 ? (data ? moment(data).format('lll') : 'TBD') : String(data))}</div>;
    return <a style={{whiteSpace: 'nowrap'}} href={this.state.mode + "/" + row[0]}>{data}</a>
  },
  render() {

    var self = this;
    var sortDirArrow = '';

    if (this.state.sortDir !== null) {
      sortDirArrow = this.state.sortDir === SortTypes.DESC ? ' ↓' : ' ↑';
    }

    function rowGetter(rowIndex) {
      return self.state.rows[rowIndex];
    }

    return (
      <div style={{width:'100%'}}>
        <Header {...this.state} />

        <div className='container' style={{marginTop:40}}>
          <div className='col-md-9' role='main'>
            <h1>Overview</h1>

            <p className="lead">{this.state.overview}</p>

            <div className='table-box' ref='tableBox'>
              <div className='title'>Model</div>
              <Table rowHeight={37} rowGetter={rowGetter} rowsCount={this.state.rows.length} width={this.state.width}
                     height={Math.min(45 * (this.state.rows.length + 1), 500)}
                     headerHeight={37}>{
                this.state.columns.map(function (col, i) {
                  return (
                    <Column label={col + (self.state.sortBy === i ? sortDirArrow : '')} key={i}
                            width={i ? 250 : 50} dataKey={i}
                            cellRenderer={self._cellRenderer}
                            headerRenderer={self._headerRenderer}/>
                  )
                })}
              </Table>
            </div>
            <br />

            <div style={{height:30}}></div>
          </div>
          <div className='col-md-3' role='complementary'>
            <h4>Important Attributes</h4>
            {this.state.columns.map(function (col, i) {
              return (<div className="columns" key={i}>{col}</div>)
            })}
            <div style={{height:30}}></div>
          </div>
        </div>
      </div>
    )
  }

});

module.exports = App;