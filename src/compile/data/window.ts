import {AggregateOp} from '../../aggregate';
import {WindowFieldDef, WindowTransform} from '../../transform';
import {duplicate} from '../../util';
import {VgWindowTransform} from '../../vega.schema';
import {WindowOnlyOp} from '../../window';
import {DataFlowNode} from './dataflow';

/**
 * A class for the window transform nodes
 */
export class WindowTransformNode extends DataFlowNode {
  public clone(): WindowTransformNode {
      return new WindowTransformNode(duplicate(this.transform));
  }

  constructor(private transform: WindowTransform) {
    super();
  }

  public producedFields() {
    const out = {};
    this.transform.window.forEach(element => {
      out[element.as] = true;
    });

    return out;
  }

  public assemble(): VgWindowTransform {
    const fields: string[] = [];
    const ops: (AggregateOp | WindowOnlyOp)[] = [];
    const as = [];
    const params = [];
    for (const window of this.transform.window) {
      if (window.op !== undefined) {
        ops.push(window.op);
      }
      if (window.as !== undefined) {
        as.push(window.as);
      }

      if (window.param) {
        params.push(window.param);
      }

      if (window.field) {
        fields.push(window.field);
      }
    }

    const frame = this.transform.frame;
    const groupby = this.transform.groupby;
    const sort = this.transform.sort;
    const ignorePeers = this.transform.ignorePeers;

    const result: VgWindowTransform = {
      type: 'window',
      params,
      as,
      ops,
      fields,
      frame,
      ignorePeers,
      groupby,
      sort,
    };

    return result;
  }
}
