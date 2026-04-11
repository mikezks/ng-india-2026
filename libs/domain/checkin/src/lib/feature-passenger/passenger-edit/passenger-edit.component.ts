import { httpResource } from '@angular/common/http';
import { Component, computed, input, linkedSignal, numberAttribute, signal, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { apply, createManagedMetadataKey, form, FormField, FormRoot, metadata, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Address, AddressControl, addressSchema, initialAddress } from '@flight-demo/shared/core';
import { initialPassenger, Passenger } from '../../logic-passenger/model/passenger';


const ALLOWED_LASTNAMES = createManagedMetadataKey<Signal<string[]>, string[]>(
  signal => computed(() => signal() || [])
);

export function validateLastname(
  field: SchemaPath<string>,
  message: string
) {
  validate(field, ({ value, fieldTree }) => {
    const allowedLastnames = fieldTree().metadata(ALLOWED_LASTNAMES)?.() || [];
    return allowedLastnames.includes(value())
      ? null
      : {
        kind: 'forbiddenLastname',
        message: message + ' The following Lastnames are allowed: '
          + allowedLastnames?.join(', ')
      };
  })
}

const names = signal(['Muster', 'Sorglos', 'Müller', 'Smith']);

// (3) Field Logic: Validators, Metadata, Conditional Disabled
export const passengerSchema = schema<Passenger & {
  address: Address
}>(passengerPath => {
  metadata(passengerPath.name, ALLOWED_LASTNAMES, () => names());
  required(passengerPath.firstName, {
    message: 'The Firstname is mandatory. Please enter a value.'
  });
  validateLastname(passengerPath.name,
    'The entered Lastname is not allowed.'
  );
  apply(passengerPath.address, addressSchema);
});


@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    // (4) UI Control: Template Binding
    FormField,
    AddressControl,
    FormRoot
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  // (1) Data Model: Writable Signal
  protected readonly passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }), { defaultValue: initialPassenger });
  protected readonly passengerWithAddress = linkedSignal(() => ({
    ...this.passengerResource.value(),
    address: initialAddress
  }));

  // (2) Field State: value, valid, dirty, touched, ...
  protected readonly editForm = form(this.passengerWithAddress, passengerSchema);

  readonly id = input(0, { transform: numberAttribute });

  protected readonly allowedLastnames = computed(() =>
    this.editForm.name().metadata(ALLOWED_LASTNAMES)?.().join(', ')
  );

  protected save(): void {
    console.log(this.editForm().value());
  }
}
