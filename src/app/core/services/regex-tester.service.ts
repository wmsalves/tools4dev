import { Injectable } from '@angular/core';

export interface RegexMatch {
  match: string;
  index: number;
  groups: (string | undefined)[];
}

export interface RegexTestResult {
  matches: RegexMatch[];
  error: string | null;
  highlightedText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegexTesterService {
  test(pattern: string, flags: string, testString: string): RegexTestResult {
    if (!pattern) {
      return { matches: [], error: null };
    }

    let regex: RegExp;
    try {
      const effectiveFlags = flags.includes('g') ? flags : flags + 'g';
      regex = new RegExp(pattern, effectiveFlags);
    } catch (e: any) {
      return { matches: [], error: e.message };
    }

    const matches: RegexMatch[] = [];
    let match;

    while ((match = regex.exec(testString)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: [...match.slice(1)],
      });

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }

    return { matches, error: null };
  }
}
