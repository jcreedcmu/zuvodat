type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type Elim<T extends { t: string }, U extends string> = T extends { t: U } ? never : T;
type Choose<T extends { t: string }, U extends string> = T extends { t: U } ? T : never;
type Prog<T, U> = { k: 'src', v: T } | { k: 'ans', v: U };

interface PreMatcher<T extends { t: string }> {
  cas<S extends string, U>(tag: S, f: (x: Omit<Choose<T, S>, 't'>) => U): Matcher<Elim<T, S>, U>;
  give<U>(): Matcher<T, U>;
}

interface Matcher<T extends { t: string }, U> {
  cas<S extends string>(tag: S, f: (x: Omit<Choose<T, S>, 't'>) => U): Matcher<Elim<T, S>, U>;
  done(): [T] extends [never] ? U : unknown;
}

class PreMatch<T extends { t: string }> implements PreMatcher<T> {
  data: T;
  constructor(data: T) {
    this.data = data;
  }
  cas<S extends string, U>(tag: S, f: (x: Omit<Choose<T, S>, 't'>) => U): Match<Elim<T, S>, U> {
    if (this.data.t == tag)
      return new Match<Elim<T, S>, U>({ k: 'ans', v: f(this.data as Choose<T, S>) })
    else
      return new Match<Elim<T, S>, U>({ k: 'src', v: this.data as Elim<T, S> });
  }
  give<U>(): Match<T, U> {
    return new Match<T, U>({ k: 'src', v: this.data });
  }
}

class Match<T extends { t: string }, U> implements Matcher<T, U> {
  data: Prog<T, U>;
  constructor(data: Prog<T, U>) {
    this.data = data;
  }
  cas<S extends string>(tag: S, f: (x: Omit<Choose<T, S>, 't'>) => U): Match<Elim<T, S>, U> {
    if (this.data.k == 'src' && this.data.v.t == tag)
      return new Match<Elim<T, S>, U>({ k: 'ans', v: f(this.data.v as Choose<T, S>) })
    else
      return new Match(this.data as Prog<Elim<T, S>, U>);
  }
  done(): [T] extends [never] ? U : unknown {
    return (this as any).data.v as any;
  }
}

export function match<T extends { t: string }, U>(data: T): PreMatcher<T> {
  return new PreMatch<T>(data);
}
