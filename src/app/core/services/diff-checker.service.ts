import { Injectable } from '@angular/core';
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from 'diff-match-patch';

export type DiffSegment = [number, string];
export { DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL };

@Injectable({
  providedIn: 'root',
})
export class DiffCheckerService {
  private dmp: typeof diff_match_patch.prototype;

  constructor() {
    this.dmp = new diff_match_patch();
  }

  compare(text1: string, text2: string): DiffSegment[] {
    const diffs = this.dmp.diff_main(text1, text2);

    this.dmp.diff_cleanupSemantic(diffs);

    return diffs;
  }
}
