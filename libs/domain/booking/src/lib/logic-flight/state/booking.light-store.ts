import { inject } from '@angular/core';
import { addMinutes, delegated } from '@flight-demo/shared/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';
import { FlightService } from '../data-access/flight.service';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';


export const BookingStore = signalStore(
  { providedIn: 'root' },
  withState({
    filter: {
      from: 'New York',
      to: 'Paris',
      urgent: false
    },
    basket: {
      3: true,
      5: true
    } as Record<number, boolean>,
    flights: [] as Flight[]
  }),
  withMethods(store => ({
    setFilter: (filter: FlightFilter) =>
      patchState(store, { filter }),
    updateBasket: (id: number, selected: boolean) =>
      patchState(store, state => ({ basket: {
        ...state.basket,
        [id]: selected
    }})),
    delayFlight: (id: number, min = 5) =>
      patchState(store, state => ({ flights: state.flights
        .map(flight => flight.id === id
          ? {
            ...flight,
            date: addMinutes(flight.date, min)
          }
          : flight
        )
      })),
      setFlights: (flights: Flight[]) =>
        patchState(store, { flights }),
    })),
    // DI & Public Writable State Facade
    withProps(store => ({
      _flightService: inject(FlightService),
      writableFilter: delegated(
        store.filter,
        store.setFilter
      ),
      createFlightWithDelayUpdater: (flight: Flight) => delegated(
        () => flight,
        () => store.delayFlight(flight.id)
      ),
      createBasketSelection: (id: number) => delegated(
        () => store.basket()[id],
        selected => store.updateBasket(id, selected)
      ),
    })),
  withMethods(store => ({
    loadFlights: rxMethod<FlightFilter>(pipe(
      switchMap(filter => store._flightService.find(
        filter.from, filter.to, filter.urgent
      ).pipe(
        tapResponse({
          next: flights => store.setFlights(flights),
          error: err => console.error(err)
        })
      ))
    )),
  })),
  withHooks(store => ({
    onInit: () => store.loadFlights(store.filter),
  }))
)