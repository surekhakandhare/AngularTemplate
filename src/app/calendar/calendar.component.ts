import { Component, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Calendar } from './calendar.model';
import { CalendarService } from './calendar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

const d = new Date();
const day = d.getDate();
const month = d.getMonth();
const year = d.getFullYear();

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.sass'],
  providers: [ToastrService],
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar', { static: false })
  calendar: Calendar | null;
  calendarForm: FormGroup;
  dialogTitle: string;
  filterOptions = 'All';
  calendarData: any;
  isEditClick: boolean;

  public filters = [
    { id: 'radio1', name: 'all', value: 'All', checked: 'true' },
    { id: 'radio2', name: 'work', value: 'Work', checked: 'false' },
    { id: 'radio3', name: 'personal', value: 'Personal', checked: 'false' },
    { id: 'radio4', name: 'important', value: 'Important', checked: 'false' },
    { id: 'radio5', name: 'travel', value: 'Travel', checked: 'false' },
    { id: 'radio6', name: 'friends', value: 'Friends', checked: 'false' },
  ];

  calendarVisible = true;
  calendarPlugins = [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    listPlugin,
  ];
  calendarWeekends = true;
  @ViewChild('callAPIDialog', { static: false }) callAPIDialog: TemplateRef<
    any
  >;
  calendarEvents: EventInput[];
  tempEvents: EventInput[];
  todaysEvents: EventInput[];

  constructor(
    private fb: FormBuilder,
    public calendarService: CalendarService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.dialogTitle = 'Add New Event';
    this.calendar = new Calendar({});
    this.calendarForm = this.createContactForm();
  }

  public ngOnInit(): void {
    this.calendarEvents = this.events();
    this.tempEvents = this.calendarEvents;
  }

  createContactForm(): FormGroup {
    return this.fb.group({
      id: [this.calendar.id],
      title: [this.calendar.title, [Validators.required]],
      category: [this.calendar.category],
      startDate: [this.calendar.startDate, [Validators.required]],
      endDate: [this.calendar.endDate, [Validators.required]],
      details: [this.calendar.details],
    });
  }

  eventWindowCall(row, type, content) {
    if (type === 'editEvent') {
      this.dialogTitle = row.event.title;
      this.isEditClick = true;
      this.calendarForm.setValue({
        id: row.event.id,
        title: row.event.title,
        category: row.event.groupId,
        startDate: formatDate(row.event.start, 'yyyy-MM-dd', 'en') || '',
        endDate: formatDate(row.event.end, 'yyyy-MM-dd', 'en') || '',
        details: row.event.extendedProps.details,
      });
    }

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }
  editEvent(form: FormGroup) {
    this.calendarData = form.value;

    this.calendarEvents.forEach(function (element, index) {
      if (this.calendarData.id === element.id) {
        this.saveEditEvent(index, this.calendarData);
      }
    }, this);
  }

  saveEvent(form: FormGroup) {
    this.calendarData = form.value;
    this.calendarEvents = this.calendarEvents.concat({
      // add new event data. must create new array
      id: this.calendarData.id,
      title: this.calendarData.title,
      start: this.calendarData.startDate,
      end: this.calendarData.endDate,
      className: this.getClassNameValue(this.calendarData.category),
      groupId: this.calendarData.category,
      details: this.calendarData.details,
    });
    this.calendarForm.reset();
    this.modalService.dismissAll();
    this.showNotification(
      'success',
      'Save Event Successfully...!!!',
      'top',
      'right'
    );
  }

  saveEditEvent(eventIndex, calendarData) {
    const calendarEvents = this.calendarEvents.slice();
    const singleEvent = Object.assign({}, calendarEvents[eventIndex]);
    singleEvent.id = calendarData.id;
    singleEvent.title = calendarData.title;
    singleEvent.start = calendarData.startDate;
    singleEvent.end = calendarData.endDate;
    singleEvent.className = this.getClassNameValue(calendarData.category);
    singleEvent.groupId = calendarData.category;
    singleEvent.details = calendarData.details;
    calendarEvents[eventIndex] = singleEvent;
    this.calendarEvents = calendarEvents; // reassign the array

    this.calendarForm.reset();
    this.modalService.dismissAll();
    this.showNotification(
      'success',
      'Edit Event Successfully...!!!',
      'top',
      'right'
    );
  }
  handleEventRender(info) {
    // console.log(info)
  }

  changeCategory(event) {
    this.filterOptions = event.target.value;
    this.calendarEvents = this.tempEvents;
    this.calendarEvents.forEach(function (element, index) {
      if (
        this.filterOptions !== 'All' &&
        this.filterOptions.toLowerCase() !== element.groupId
      ) {
        this.filterEvent(element);
      }
    }, this);
  }
  filterEvent(element) {
    this.calendarEvents = this.calendarEvents.filter(
      (item) => item !== element
    );
  }
  onNoClick(): void {}
  showNotification(eventType, message, ypos, xpos) {
    if (eventType === 'success') {
      this.toastr.success(message, '', {
        positionClass: 'toast-' + ypos + '-' + xpos,
      });
    }
  }
  public randomIDGenerate(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  }
  getClassNameValue(category) {
    let className: string;

    if (category === 'work') {
      className = 'fc-event-success';
    } else if (category === 'personal') {
      className = 'fc-event-warning';
    } else if (category === 'important') {
      className = 'fc-event-primary';
    } else if (category === 'travel') {
      className = 'fc-event-danger';
    } else if (category === 'friends') {
      className = 'fc-event-info';
    }

    return className;
  }
  events() {
    return [
      {
        id: 'event1',
        title: 'All Day Event',
        start: new Date(year, month, 1, 0, 0),
        end: new Date(year, month, 1, 23, 59),
        className: 'fc-event-success',
        groupId: 'work',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event2',
        title: 'Break',
        start: new Date(year, month, day + 28, 16, 0),
        end: new Date(year, month, day + 29, 20, 0),
        allDay: false,
        className: 'fc-event-primary',
        groupId: 'important',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see. ',
      },
      {
        id: 'event3',
        title: 'Shopping',
        start: new Date(year, month, day + 4, 12, 0),
        end: new Date(year, month, day + 4, 20, 0),
        allDay: false,
        className: 'fc-event-warning',
        groupId: 'personal',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see. ',
      },
      {
        id: 'event4',
        title: 'Meeting',
        start: new Date(year, month, day + 14, 10, 30),
        end: new Date(year, month, day + 16, 20, 0),
        allDay: false,
        className: 'fc-event-success',
        groupId: 'work',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event5',
        title: 'Lunch',
        start: new Date(year, month, day, 11, 0),
        end: new Date(year, month, day, 14, 0),
        allDay: false,
        className: 'fc-event-primary',
        groupId: 'important',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event6',
        title: 'Meeting',
        start: new Date(year, month, day + 2, 12, 30),
        end: new Date(year, month, day + 2, 14, 30),
        allDay: false,
        className: 'fc-event-success',
        groupId: 'work',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event7',
        title: 'Birthday Party',
        start: new Date(year, month, day + 17, 19, 0),
        end: new Date(year, month, day + 17, 19, 30),
        allDay: false,
        className: 'fc-event-warning',
        groupId: 'personal',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event8',
        title: 'Go to Delhi',
        start: new Date(year, month, day + -5, 10, 0),
        end: new Date(year, month, day + -4, 10, 30),
        allDay: false,
        className: 'fc-event-danger',
        groupId: 'travel',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event9',
        title: 'Get To Gather',
        start: new Date(year, month, day + 6, 10, 0),
        end: new Date(year, month, day + 7, 10, 30),
        allDay: false,
        className: 'fc-event-info',
        groupId: 'friends',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
      {
        id: 'event10',
        title: 'Collage Party',
        start: new Date(year, month, day + 20, 10, 0),
        end: new Date(year, month, day + 20, 10, 30),
        allDay: false,
        className: 'fc-event-info',
        groupId: 'friends',
        details:
          'Her extensive perceived may any sincerity extremity. Indeed add rather may pretty see.',
      },
    ];
  }
}
