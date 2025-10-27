/**
 * Matrix Builder Panel Plugin Entry Point
 * Author: David Castro Moreno
 */

import { PanelPlugin } from '@grafana/data';
import { MatrixBuilderOptions, defaultOptions } from './types';
import { MatrixPanel } from './MatrixPanel';
import { OptionsEditor } from './OptionsEditor';

export const plugin = new PanelPlugin<MatrixBuilderOptions>(MatrixPanel)
  .setPanelOptions((builder) => {
    return builder.addCustomEditor({
      id: 'matrixOptions',
      path: '',
      name: 'Matrix Configuration',
      description: 'Configure your matrix grid and cells',
      editor: OptionsEditor,
      defaultValue: defaultOptions,
    });
  });
