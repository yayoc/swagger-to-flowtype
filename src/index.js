#! /usr/bin/env node
// @flow

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import axios from 'axios';
import fs from 'fs';
import Generator from './Generator';
import path from 'path';
import prettier from 'prettier';
import program from 'commander';
import yaml from 'js-yaml';

export const DEFAULT_PRETTIER_OPTIONS = {
  parser: 'babel',
};

export const generator = ( specification : Object, file : string ) => {
  const generator : Generator = new Generator();
  generator.exact = program.exact || generator.exact;
  generator.lowerCamelCase = program.lowerCamelCase || generator.lowerCamelCase;
  generator.responses = program.responses || generator.responses;
  generator.suffix = program.suffix || generator.suffix;

  const result : string = generator.generate( specification );

  const prettierOptions : any = {
    ...DEFAULT_PRETTIER_OPTIONS,
    ...( prettier.resolveConfig.sync( file ) || {} )
  };
  return prettier.format( result, prettierOptions );
};

export const writeToFile = ( dist : string = './flowtype.js', result : string ) => {
  fs.writeFile( dist, result, err => {
    if ( err ) {
      throw err;
    }
  } );
};

export const isUrl = ( value : string ) : boolean =>
  value.match( /https?:\/\// ) !== null;

export const distFile = ( p : Object, inputFileName : string ) : string => {
  if ( p.destination ) {
    return p.destination;
  }
  if ( isUrl( inputFileName ) ) {
    return './flowtype.js';
  }

  const ext = path.parse( inputFileName ).ext;
  return inputFileName.replace( ext, '.js' );
};

export const getContentFromFile = ( file : string ) : Object => {
  const ext = path.extname( file );
  const readFile = fs.readFileSync( file, 'utf8' );
  return ext === '.yaml' || ext === '.yml'
    ? yaml.safeLoad( readFile )
    : JSON.parse( readFile );
};

export const isObject = ( value : any ) : boolean =>
  typeof value === 'object' && value !== null;

export const getContentFromUrl = ( url : string ) : Promise< Object > =>
  axios( {
    method: 'get',
    url,
  } ).then( response => {
    const { data } = response;
    return isObject( data ) ? data : yaml.safeLoad( data );
  } );

export const getContent = ( fileOrUrl : string ) : Promise< Object > => {
  if ( isUrl( fileOrUrl ) ) {
    return getContentFromUrl( fileOrUrl );
  }
  const content = getContentFromFile( fileOrUrl );
  return Promise.resolve( content );
};

program
  .arguments( '<file>' )
  .option( '-d --destination <destination>', 'Destination path' )
  .option( '-e --exact', 'Add exact types' )
  .option( '--suffix <suffix>', 'Add suffix (like "Type") to all generated types' )
  .option(
    '-l --lower-camel-case',
    'Transform property keys to lower camel case'
  )
  .action( async file => {
    try {
      const content = await getContent( file );
      const result = generator( content, file );
      const dist = distFile( program, file );
      writeToFile( dist, result );
      console.log( `Generated flow types to ${dist}` );
    } catch ( e ) {
      console.log( e );
    }
  } )
  .parse( process.argv );
