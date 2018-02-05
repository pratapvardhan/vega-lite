import {AggregateOp} from './aggregate';
import {BinParams} from './bin';
import {Data} from './data';
import {LogicalOperand, normalizeLogicalOperand} from './logical';
import {normalizePredicate, Predicate} from './predicate';
import {TimeUnit} from './timeunit';
import {WindowOnlyOp} from './window';


export interface FilterTransform {
  /**
   * The `filter` property must be one of the predicate definitions:
   * (1) an [expression](https://vega.github.io/vega-lite/docs/types.html#expression) string,
   * where `datum` can be used to refer to the current data object;
   * (2) one of the field predicates: [equal predicate](https://vega.github.io/vega-lite/docs/filter.html#equal-predicate);
   * [range predicate](filter.html#range-predicate), [one-of predicate](https://vega.github.io/vega-lite/docs/filter.html#one-of-predicate);
   * (3) a [selection predicate](https://vega.github.io/vega-lite/docs/filter.html#selection-predicate);
   * or (4) a logical operand that combines (1), (2), or (3).
   */
  // TODO: https://github.com/vega/vega-lite/issues/2901
  filter: LogicalOperand<Predicate>;
}

export function isFilter(t: Transform): t is FilterTransform {
  return t['filter'] !== undefined;
}

export interface CalculateTransform {
  /**
   * A [expression](https://vega.github.io/vega-lite/docs/types.html#expression) string. Use the variable `datum` to refer to the current data object.
   */
  calculate: string;

  /**
   * The field for storing the computed formula value.
   */
  as: string;
}

export interface BinTransform {
  /**
   * An object indicating bin properties, or simply `true` for using default bin parameters.
   */
  bin: boolean | BinParams;

  /**
   * The data field to bin.
   */
  field: string;

  /**
   * The output fields at which to write the start and end bin values.
   */
  as: string;
}

export interface TimeUnitTransform {
  /**
   * The timeUnit.
   */
  timeUnit: TimeUnit;

  /**
   * The data field to apply time unit.
   */
  field: string;

  /**
   * The output field to write the timeUnit value.
   */
  as: string;
}

export interface AggregateTransform {
  /**
   * Array of objects that define fields to aggregate.
   */
  aggregate: AggregatedFieldDef[];

  /**
   * The data fields to group by. If not specified, a single group containing all data objects will be used.
   */
  groupby?: string[];
}

export interface AggregatedFieldDef {
  /**
   * The aggregation operations to apply to the fields, such as sum, average or count.
   * See the [full list of supported aggregation operations](https://vega.github.io/vega-lite/docs/aggregate.html#ops)
   * for more information.
   */
  op: AggregateOp;

  /**
   * The data field for which to compute aggregate function.
   */
  field: string;

  /**
   * The output field names to use for each aggregated field.
   */
  as: string;
}

export interface WindowFieldDef {
  /**
   * The operations supported for the window aggregation. See the list of supported operations here:
   *   https://vega.github.io/vega/docs/transforms/window/#ops
   */
  op: AggregateOp | WindowOnlyOp;

  /**
   * The optional parameters for the operation. For example the window operator (nth_value)
   * takes a parameter N and returns the nth value in the current frame.
   */
  param?: number;

  /**
   * The field that will be used in the operation, some operations
   * do not require fields.
   */
  field?: string;

  /**
   * The name for the new field in the window transform.
   */
  as?: string;
}

export interface WindowTransform {
  /**
   * Array of objects that summarize the fields that will be aggregated over the window.
   */
  window: WindowFieldDef[];

  /**
   * The frame for the window, if none is set the default is `[null, 0]` everything before the
   * current item.
   */
  frame?: (null | number)[];

  /**
   * Whether to ignoreThePeers during the comparison in the window.
   */
  ignorePeers?: boolean;

  /**
   * The fields to group by.
   */
  groupby?: string[];

  /**
   * The comparator to use to determine the window.
   */
  sort?: Comparator;
}

export interface LookupData {
  /**
   * Secondary data source to lookup in.
   */
  data: Data;
  /**
   * Key in data to lookup.
   */
  key: string;
  /**
   * Fields in foreign data to lookup.
   * If not specified, the entire object is queried.
   */
  fields?: string[];
}

export interface LookupTransform {
  /**
   * Key in primary data source.
   */
  lookup: string;

  /**
   * Secondary data reference.
   */
  from: LookupData;

  /**
   * The field or fields for storing the computed formula value.
   * If `from.fields` is specified, the transform will use the same names for `as`.
   * If `from.fields` is not specified, `as` has to be a string and we put the whole object into the data under the specified name.
   */
  as?: string | string[];

  /**
   * The default value to use if lookup fails.
   *
   * __Default value:__ `null`
   */
  default?: string;
}


/**
 * A comparator fields
 */
export interface ComparatorField {
  field: string;
  order?: ('ascending' | 'descending');
}

export interface Comparator {
  /**
   * The field that will be compared
   */
  compare: ComparatorField[];
}

export function isLookup(t: Transform): t is LookupTransform {
  return t['lookup'] !== undefined;
}

export function isWindow(t: Transform): t is WindowTransform {
  return t['window'] !== undefined;
}

export function isCalculate(t: Transform): t is CalculateTransform {
  return t['calculate'] !== undefined;
}

export function isBin(t: Transform): t is BinTransform {
  return !!t['bin'];
}

export function isTimeUnit(t: Transform): t is TimeUnitTransform {
  return t['timeUnit'] !== undefined;
}

export function isAggregate(t: Transform): t is AggregateTransform {
  return t['aggregate'] !== undefined;
}

export type Transform = FilterTransform | CalculateTransform | LookupTransform | BinTransform | TimeUnitTransform | AggregateTransform | WindowTransform;

export function normalizeTransform(transform: Transform[]) {
  return transform.map(t => {
    if (isFilter(t)) {
      return {
        filter: normalizeLogicalOperand(t.filter, normalizePredicate)
      };
    }
    return t;
  });
}
