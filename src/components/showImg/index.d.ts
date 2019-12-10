import React from 'react';

export interface ShowImgProps {
  src?: string[];
  style?: React.CSSProperties;
  className?: string;
}

export default class ShowImg extends React.Component<ShowImgProps, any> {}
