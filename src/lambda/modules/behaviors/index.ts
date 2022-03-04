import { Behavior } from '../../types';
import { voteBehavior } from './vote';
import {
    wordBehavior,
    wordsBehavior,
    addBehavior,
    searchBehavior,
    hrBehavior,
} from './word';

export const behaviors: Behavior[] = [
    voteBehavior,
    wordBehavior,
    wordsBehavior,
    addBehavior,
    searchBehavior,
    hrBehavior,
];
