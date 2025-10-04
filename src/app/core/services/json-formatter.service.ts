import { Injectable } from '@angular/core';

export interface FormatResult {
  formattedJson: string | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class JsonFormatterService {
  format(jsonString: string): FormatResult {
    try {
      if (!jsonString.trim()) {
        return { formattedJson: '', error: null };
      }
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      return { formattedJson: formatted, error: null };
    } catch (e: any) {
      const errorMessage = e.message.startsWith('Unexpected token')
        ? 'Invalid JSON: ' + e.message
        : e.message;
      return { formattedJson: null, error: errorMessage };
    }
  }
}
