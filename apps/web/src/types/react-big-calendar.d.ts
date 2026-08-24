declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface Event {
    id?: any;
    title?: any;
    allDay?: boolean;
    start?: Date;
    end?: Date;
    resource?: any;
  }

  export type View = 'month' | 'week' | 'day' | 'agenda';

  export interface ViewsProps {
    month?: boolean | object;
    week?: boolean | object;
    day?: boolean | object;
    agenda?: boolean | object;
  }

  export interface ToolbarProps {
    view: View;
    views: View[];
    label: string;
    onNavigate: (action: Date | 'PREV' | 'NEXT' | 'TODAY') => void;
    onView: (view: View) => void;
  }

  export interface CalendarProps<TEvent extends object = Event> {
    date?: Date;
    view?: View;
    localizer: any;
    events?: TEvent[];
    onNavigate?: (date: Date, view: View, action: string) => void;
    onView?: (view: View) => void;
    onSelectEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: {
      start: Date;
      end: Date;
      action: 'select' | 'click' | 'doubleClick';
      slots: Date[];
    }) => void;
    onDoubleClickEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined;
    selectable?: boolean | 'ignoreEvents';
    longPressThreshold?: number;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    step?: number;
    timeslots?: number;
    culture?: string;
    formats?: object;
    messages?: object;
    views?: View[] | ViewsProps;
    drilldownView?: View | null;
    getDrilldownView?:
      ((targetDate: Date, currentView: View, configuredView: View) => View | null) | null;
    length?: number;
    toolbar?: boolean;
    className?: string;
    style?: React.CSSProperties;
    elementProps?: React.HTMLAttributes<HTMLElement>;
    components?: {
      event?: ComponentType<any>;
      eventWrapper?: ComponentType<any>;
      eventContainerWrapper?: ComponentType<any>;
      dayWrapper?: ComponentType<any>;
      dayColumnWrapper?: ComponentType<any>;
      dateCellWrapper?: ComponentType<any>;
      timeSlotWrapper?: ComponentType<any>;
      timeGutterWrapper?: ComponentType<any>;
      toolbar?: ComponentType<ToolbarProps>;
      agenda?: {
        date?: ComponentType<any>;
        time?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      week?: {
        header?: ComponentType<any>;
        timeSlotWrapper?: ComponentType<any>;
      };
      day?: {
        header?: ComponentType<any>;
        timeSlotWrapper?: ComponentType<any>;
      };
      month?: {
        header?: ComponentType<any>;
        dateHeader?: ComponentType<any>;
        weekNumber?: ComponentType<any>;
      };
    };
    eventPropGetter?: (
      event: TEvent,
      start: Date,
      end: Date,
      isSelected: boolean,
    ) => { className?: string; style?: React.CSSProperties };
    slotPropGetter?: (
      date: Date,
      resourceId?: string | number,
    ) => { className?: string; style?: React.CSSProperties };
    dayPropGetter?: (date: Date) => { className?: string; style?: React.CSSProperties };
    showMultiDayTimes?: boolean;
    dayLayoutAlgorithm?: 'no-overlap' | 'overlap' | 'stack';
    dayRangeFormatter?: (start: Date, end: Date, culture?: string, localizer?: any) => string;
    resourceIdAccessor?: string | ((event: TEvent) => string | number);
    resources?: any[];
    defaultView?: View;
    defaultDate?: Date;
    startAccessor?: string | ((event: TEvent) => Date);
    endAccessor?: string | ((event: TEvent) => Date);
  }

  export interface dateFnsLocalizer {
    (args: {
      startOfWeek: (date: Date) => Date;
      getDay: (date: Date) => number;
      locales: object;
      format: (date: Date, format: string, options?: object) => string;
      parse: (value: string, formatStr: string, referenceDate?: any) => any;
    }): {
      format(date: Date, format: string, options?: { locale?: object }): string;
      parse(value: string, formatStr: string, referenceDate?: any): any;
      startOfWeek(date: Date, options?: { locale?: object }): Date;
      getDay(date: Date): number;
      locales: object;
      messages: any;
    };
  }

  export const Calendar: ComponentType<CalendarProps>;
  export const Views: { MONTH: 'month'; WEEK: 'week'; DAY: 'day'; AGENDA: 'agenda' };
  export const Navigate: { PREV: 'PREV'; NEXT: 'NEXT'; TODAY: 'TODAY'; DATE: 'DATE' };
  export const components: any;

  export function dateFnsLocalizer(config: {
    startOfWeek: (...args: any[]) => any;
    getDay: (...args: any[]) => any;
    locales: object;
    format: (...args: any[]) => string;
    parse: (...args: any[]) => any;
  }): ReturnType<dateFnsLocalizer>;
}
