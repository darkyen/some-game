import {Dispatcher} from 'flux';
import Constants from './Constants';

/**
 * Purpose: to create a single dispatcher instance for use throughout the
 * entire app. The two methods below are merely thin wrappers that describe
 * where the action originated from. Not mandatory, but may be helpful
 **/
export default new Dispatcher();
