import React from 'react';
import { Image, ImageStyle } from 'react-native';

type BlueDropsLogoProps = {
  width?: number;
  height?: number;
  color?: string;
  style?: ImageStyle;
};

export const BlueDropsLogo = ({ 
  width = 200, 
  height = 51, 
  color, 
  style 
}: BlueDropsLogoProps) => {
  return (
    <Image
      source={{ uri: 'https://i.imgur.com/QJxTIcN.png' }}
      style={[
        {
          width,
          height,
          resizeMode: 'contain',
        },
        style
      ]}
    />
  );
};