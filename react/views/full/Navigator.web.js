import { useState, useEffect, useRef } from "react";
import { View } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { State } from 'react-native-track-player';

import SearchTab from "../tabs/SearchTab";
import HomeTab from "../tabs/HomeTab";
import LibraryTab from "../tabs/LibraryTab";
import SettingsTab from "../tabs/SettingsTab";

import Music from "../../services/music/Music";

import { navigationOptions } from "../../App";
import { getIcon } from "../../utils/Icon";
import { headerStyle } from "../../styles/App";
import Header from "../../components/overlay/Header";
import MiniPlayer from "../../components/player/MiniPlayer";

const getTabOptions = title => {
    return { tabBarIcon: ({ color }) => getIcon({title, color}) };
}

const Nav = createMaterialTopTabNavigator();
const tabOptions = {
    lazy: false,
    optimizationsEnabled: true,
    tabBarHideOnKeyboards: true,
    tabBarShowLabel: false,
    gestureEnabled: true,
    swipeEnabled: true,
    animationEnabled: true
};

const getHeight = state => [State.Stopped, State.None].includes(state) ? "0px" : "50px";

var firstRoute;
var fixedNavigation;
export default Navigator = () => {
    const [marginBottom, setMarginBottom] = useState(getHeight(Music.state));
    const [headerTitle, setHeaderTitle] = useState(null);
    const view = useRef(null);

    useEffect(() => {
        const navigator = view.current.childNodes[1].childNodes[0];
        navigator.style.marginBottom = marginBottom;
    }, [marginBottom]);
    
    useEffect(() => {
        const navigator = view.current.childNodes[1].childNodes[0];
        navigator.style.transition = "margin-bottom .25s";
        
        const stateListener = Music.addListener(
            Music.EVENT_STATE_UPDATE,
            state => setMarginBottom(getHeight(state))
        );

        return () => stateListener.remove();
    }, []);

    const moveMargin = px => {
        const navigator = view.current.childNodes[1].childNodes[0];
        navigator.style.transition = "";
        navigator.style.marginBottom = px;
    };

    const resetMargin = () => {
        const navigator = view.current.childNodes[1].childNodes[0];
        navigator.style.transition = "margin-bottom .25s";
        navigator.style.marginBottom = getHeight(Music.state);
    }

    return <View style={{flex: 1}} ref={view}>
        <Header style={headerStyle.headerPicture} title={headerTitle}/>
        <Nav.Navigator
            tabBarPosition="bottom"
            overScrollMode="always"
            sceneAnimationEnabled={true} shifting={true} labeled={true}
            screenOptions={{...tabOptions, ...navigationOptions}}
            screenListeners={({route, navigation}) => {
                if (!fixedNavigation) {
                    if (firstRoute == undefined) {
                        firstRoute = route.name;
                        if (route.name == "Home")
                            fixedNavigation = true;
                    } else {
                        if (route.name == "Home") {
                            fixedNavigation = true;
                            navigation.reset({
                                index: 0,
                                routes: [{name: "Home"}],
                            });
                        }
                    }
                }

                setHeaderTitle(route.name);
            }}
        >
            <Nav.Screen name="Home" component={HomeTab} options={getTabOptions("home")}/>
            <Nav.Screen name="Search" component={SearchTab} options={getTabOptions("search")}/>
            <Nav.Screen name="Library" component={LibraryTab} options={getTabOptions("folder")}/>
            <Nav.Screen name="Settings" component={SettingsTab} options={getTabOptions("settings")}/>
        </Nav.Navigator>
        <MiniPlayer
            containerStyle={{position: "absolute", bottom: 48, width: "100%", height: marginBottom}}
            style={{maxWidth: 800}}
            moveMargin={moveMargin}
            resetMargin={resetMargin}
        />
    </View>
}