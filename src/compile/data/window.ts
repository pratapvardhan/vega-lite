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
      ops.push(window.op);
      as.push(window.as);
      params.push(window.param);
      fields.push(window.field);
    }

    const result: VgWindowTransform = {
      type: 'window',
      params,
      as,
      ops,
      fields,
      frame: this.transform.frame,
      ignorePeers: this.transform.ignorePeers,
      groupby: this.transform.groupby,
      sort: this.transform.sort,
    };

    return result;
  }
}
