import React from 'react';

export interface WangEditorProps {
  onChangeVal?: (value?: string | string[] | number) => void;
  defaultValue?: string;
}

export default class WangEditor extends React.Component<WangEditorProps, any> {}
