import {
  themeAlpine,
  colorSchemeDark,
  colorSchemeLight,
} from 'ag-grid-community';

export const agGridLightTheme = themeAlpine
  .withPart(colorSchemeLight)
  .withParams({
    backgroundColor: 'hsl(0 0% 100%)',
    foregroundColor: 'hsl(222.2 84% 4.9%)',
    borderColor: 'hsl(214.3 31.8% 91.4%)',
    headerBackgroundColor: 'hsl(210 40% 96.1%)',
    rowHoverColor: 'hsl(210 40% 96.1%)',
    selectedRowBackgroundColor: 'hsl(210 40% 96.1%)',
    oddRowBackgroundColor: 'hsl(0 0% 100%)',
  });

export const agGridDarkTheme = themeAlpine
  .withPart(colorSchemeDark)
  .withParams({
    backgroundColor: 'hsl(222.2 84% 4.9%)',
    foregroundColor: 'hsl(210 40% 98%)',
    borderColor: 'hsl(217.2 32.6% 17.5%)',
    headerBackgroundColor: 'hsl(217.2 32.6% 17.5%)',
    rowHoverColor: 'hsl(217.2 32.6% 22%)',
    selectedRowBackgroundColor: 'hsl(217.2 32.6% 22%)',
    oddRowBackgroundColor: 'hsl(222.2 84% 4.9%)',
  });
