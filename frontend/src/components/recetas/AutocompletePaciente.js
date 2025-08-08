import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

const mockPacientes = [
  { id: 1, nombre: "Juan Pérez", dni: "12345678" },
  { id: 2, nombre: "Ana Gómez", dni: "87654321" },
  { id: 3, nombre: "Luis Fernández", dni: "11223344" },
];

export default function AutocompletePaciente({ control, name }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          {...field}
          onChange={(_, value) => field.onChange(value)}
          className="autocomplete-paciente"
          options={mockPacientes}
          getOptionLabel={(option) =>
            option?.nombre && option?.dni
              ? `${option.nombre} (${option.dni})`
              : ""
          }
          renderInput={(params) => (
            <TextField
              placeholder="Ingrese el nombre o DNI del paciente"
              className="text-field"
              {...params}
            />
          )}
        />
      )}
    />
  );
}
