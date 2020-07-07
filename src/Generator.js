// @flow

import camelize from 'camelize';

// OpenAPI data types are base on types supported by the JSON-Scheme Draft4.
const typeMapping = {
  array: 'Array<*>',
  boolean: 'boolean',
  integer: 'number',
  number: 'number',
  null: 'null',
  object: 'Object',
  Object: 'Object',
  string: 'string',
  enum: 'string',
};

const stripBrackets = ( name : string ) => name.replace( /[[\]']+/g, '' );

const isRequired = ( propertyName : string, definition : Object ) : boolean => {
  const result =
    definition.required && definition.required.indexOf( propertyName ) >= 0;
  return result;
};

const isNullable = ( property : Object ) : boolean => property.nullable;

const withExact = ( property : string ) : string => {
  const result = property.replace( /{[^|}]/g, '{|' ).replace( /[^|{]}/g, '|}' );
  return result;
};

export default class Generator {

  exact : boolean = false;
  lowerCamelCase : boolean = false;
  responses : boolean = false;
  suffix : string = '';

  definitionTypeName( ref : string ) {
    const re = /#\/components\/schemas\/(.*)/;
    const found = ref.match( re );
    if ( !found ) {
      return '';
    }
    return found[ 1 ] + this.suffix;
  }

  generate( specification : any ) : string {
    return '// @flow strict\n' + this.generateImpl( specification );
  }

  generateImpl( specification : any ) : string {
    const toProcess : Map< string, any > = new Map();
    for ( const [key, schema] of Object.entries( ((specification || {}).components || {}).schemas || {} )) {
      toProcess.set(key, schema);
    }

    if ( this.responses ) {
      for ( const byPath of Object.values(specification.paths || {}) ) {
        for ( const byMethod of Object.values(byPath) ) {
          for ( const byReturnCode of Object.values( byMethod.responses || {}) ) {
            for ( const byMime of Object.values( byReturnCode.content || {}) ) {
              const {schema} = byMime;
              if (!schema) continue;
              if (!schema.title) continue;
              toProcess.set(schema.title, schema);
            }
          }
        }
      }
    }

    if ( toProcess.size === 0 ) {
      throw new Error( 'There is no definitions in file, is it really OpenAPI 3.x?' );
    }

    const result : string[] = [];
    for ( const [ definitionName, def ] of toProcess ) {
      const typeDefinition : string = `export type ${stripBrackets( definitionName )}${this.suffix} = ${this.propertiesTemplate(
        this.propertiesList( def )
      ).replace( /"/g, '' )};`;
      result.push( typeDefinition );
    }

    return result.join("\n");
  }

  propertiesList( definition : any ) {
    if ( 'allOf' in definition ) {
      return definition.allOf.map( this.propertiesList, this );
    }

    if ( definition.$ref ) {
      return { $ref: this.definitionTypeName( definition.$ref ) };
    }

    if ( 'type' in definition && definition.type !== 'object' ) {
      return this.typeFor( definition );
    }

    if (
      !definition.properties ||
      Object.keys( definition.properties ).length === 0
    ) {
      return {};
    }

    // TODO: change to ES6
    return Object.assign.apply(
      null,
      // $FlowFixMe
      Object.keys( definition.properties ).reduce(
        ( properties : Object[], propName : string ) => {
          const property = definition.properties[ propName ];
          const arr = properties.concat( {
            [ this.propertyKeyForDefinition( propName, definition ) ]: `${
              isNullable( property ) ? '?' : ''
            }${this.typeFor( property )}`,
          } );
          return arr;
        },
        [ {} ]
      )
    );
  }

  propertiesTemplate( properties : Object | Object[] | string ) : string {
    if ( typeof properties === 'string' ) {
      return properties;
    }
    if ( Array.isArray( properties ) ) {
      return properties
        .map( property => {
          let p = property.$ref ? `& ${property.$ref}` : JSON.stringify( property );
          if ( !property.$ref && this.exact ) {
            p = withExact( p );
          }
          return p;
        } )
        .sort( a => ( a[ 0 ] === '&' ? 1 : -1 ) )
        .join( ' ' );
    }
    if ( this.exact ) {
      return withExact( JSON.stringify( properties ) );
    }
    return JSON.stringify( properties );
  }

  propertyKeyForDefinition(
    propName : string,
    definition : Object
  ) : string {
    let resolvedPropName = propName.indexOf( '-' ) > 0 ? `'${propName}'` : propName;
    if ( this.lowerCamelCase ) {
      resolvedPropName = camelize( resolvedPropName );
    }
    return `${resolvedPropName}${isRequired( propName, definition ) ? '' : '?'}`;
  }

  typeFor( property : any ) : string {
    if ( property.type === 'array' ) {
      if ( 'oneOf' in property.items ) {
        return `Array<${property.items.oneOf
          .map( e =>
            e.type === 'object'
              ? this.propertiesTemplate( this.propertiesList( e.items ) ).replace( /"/g, '' )
              : this.typeFor( e )
          )
          .join( ' | ' )}>`;
      } else if ( '$ref' in property.items ) {
        return `Array<${this.definitionTypeName( property.items.$ref )}>`;
      } else if ( property.items.type === 'object' ) {
        const child = this.propertiesTemplate( this.propertiesList( property.items ) ).replace(
          /"/g,
          ''
        );
        return `Array<${child}>`;
      }
      return `Array<${typeMapping[ property.items.type ]}>`;
    } else if ( property.type === 'string' && 'enum' in property ) {
      return property.enum.map( e => `'${e}'` ).join( ' | ' );
    } else if ( Array.isArray( property.type ) ) {
      return property.type.map( t => typeMapping[ t ] ).join( ' | ' );
    } else if (
      'allOf' in property ||
      'oneOf' in property ||
      'anyOf' in property
    ) {
      const discriminator = Object.keys( property )[ 0 ];
      const discriminatorMap = {
        allOf: '&',
        oneOf: '|',
        anyOf: '|',
      };
      return property[ discriminator ]
        .map( p => this.typeFor( p ) )
        .join( discriminatorMap[ discriminator ] );
    } else if ( property.type === 'object' ) {
      return this.propertiesTemplate( this.propertiesList( property ) ).replace( /"/g, '' );
    }
    return typeMapping[ property.type ] || this.definitionTypeName( property.$ref );
  }

}
