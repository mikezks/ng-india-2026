import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FlightCardComponent } from '../../ui-flight/flight-card/flight-card.component';
import { FlightFilterComponent } from '../../ui-flight/flight-filter/flight-filter.component';
import { BookingStore } from '../../logic-flight/state/booking.light-store';


@Component({
  standalone: true,
  imports: [
    JsonPipe,
    FlightCardComponent,
    FlightFilterComponent
  ],
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  protected store = inject(BookingStore);
  // protected flightEvents = injectDispatch(flightEvents);
}
