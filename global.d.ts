import * as THREE from "three";
import { ReactThreeFiber } from "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      readonly [key: string]: ReactThreeFiber.Object3DNode<any, any>;
    }
  }
}
