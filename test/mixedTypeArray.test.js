import { DEFAULT_PRETTIER_OPTIONS, generator } from '../src/index';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import yaml from 'js-yaml';

jest.mock( 'commander', () => ( {
  checkRequired: true,
  arguments: jest.fn().mockReturnThis(),
  option: jest.fn().mockReturnThis(),
  action: jest.fn().mockReturnThis(),
  parse: jest.fn().mockReturnThis(),
} ) );

describe( 'generate flow types', () => {
  describe( 'parse mixed-type array', () => {
    it( 'should generate expected flow types', () => {
      const file = path.join(
        __dirname,
        '__mocks__/mixedTypeArray.openapi.yaml'
      );
      const content = yaml.safeLoad( fs.readFileSync( file, 'utf8' ) );
      const expected = path.join( __dirname, '__mocks__/mixedTypeArray.flow.js' );
      const expectedString = prettier.format( fs.readFileSync( expected, 'utf8' ), DEFAULT_PRETTIER_OPTIONS );
      expect( generator( content ) ).toEqual( expectedString );
    } );
  } );
} );
