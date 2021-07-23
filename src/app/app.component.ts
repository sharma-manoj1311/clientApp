import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import locale from 'date-fns/locale/en-US';
import { DatepickerOptions } from 'ng2-datepicker';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient, HttpResponse, HttpParams,HttpHeaders  } from '@angular/common/http';
import {Router} from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subject, from } from 'rxjs';
class EmployeesRecords {
  employeeId
  firstName
  lastName
  jobTittle
  age
  startDate
  endDate
}

class DataTablesRes {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
const ParseHeaders = {
  headers: new HttpHeaders({
  'Content-Type'  : 'application/json'
  })
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ DatePipe ]
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false}) dtElement: DataTableDirective;
  title = 'clientApp';
  
  startDate = '';
  endDate = '';
  searchText=''
  empData
  dtTrigger: Subject<any> = new Subject();
  dtInstance;
  empRecords: EmployeesRecords[];
  fromdateoptions: DatepickerOptions = {
    locale: locale,
    format: 'yyyy-MM-dd',
    position: 'bottom',
  };

  todateoptions: DatepickerOptions = {
    locale: locale,
    format: 'yyyy-MM-dd',
    position: 'bottom',
   
  };

  constructor(private router: Router,private http: HttpClient, private datePipe: DatePipe) { }
  dtOptions: DataTables.Settings = {};
  ngOnInit(): void {
    
    this.dtOptions =  {
      
      dom:'lBfrtip',
      data: [],
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [10,50,100,500,1000],
      serverSide: true,
      processing: true,
      responsive: true,
      searching:false,
      
        
      ajax: (dataTablesParameters: any, callback) => {
        this.empData = { startDate: this.datePipe.transform(this.startDate, 'yyyy-MM-dd'), endDate : this.datePipe.transform(this.endDate, 'yyyy-MM-dd'), searchText: this.searchText};
        
        const that = this;
        that.http
        .post<DataTablesRes>(
          'http://localhost:8080/employee-search/employee-search',JSON.stringify(Object.assign(dataTablesParameters, this.empData)), ParseHeaders
        ).toPromise().then(resp => {
         
          callback({
            data : resp['data'],
            draw:resp['draw'],
            recordsFiltered: resp['recordsFiltered'],
            recordsTotal: resp['recordsTotal']
          });
        });
      },
      
      columns: [{ data: 'employeeId' }, { data: 'firstName' }, { data: 'lastName' }, { data: 'jobTittle' }, { data: 'age' }, { data: 'startDate' }, { data: 'endDate' }]
    };

  }
  getRequestParams(searchText, startDate, endDate) {
    startDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    endDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');
    let params = {};

    if (searchText) {
      params['searchText'] = searchText;
    }

    

    if (startDate && endDate) {
      params['startDate'] = startDate;
      params['endDate'] = endDate;
    }

    return params;
  }
  getEmployeeRecords(): void {
    
    const params = this.getRequestParams(this.searchText, this.startDate, this.endDate);

    this.empData = { searchText: params['searchText'], startDate : params['startDate'], endDate: params['endDate']};
    
    const that = this;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
     
      dtInstance.destroy();
     
      this.dtTrigger.next();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }
}
