import * as React from 'react';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  // React 19 needs the initial render flushed inside `act` before the tree is readable.
  let tree: ReactTestRenderer;
  act(() => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(tree!.toJSON()).toMatchSnapshot();
});
