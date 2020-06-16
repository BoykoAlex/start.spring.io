import BodyClassName from 'react-body-classname'
import FileSaver from 'file-saver'
import get from 'lodash.get'
import React, {
    Suspense,
    lazy,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { toast } from 'react-toastify'

import useHash from '../../@oss/components/utils/Hash'
import useWindowsUtils from '../../@oss/components/utils/WindowsUtils'
import { AppContext } from '../../@oss/components/reducer/App'
import { DependencyDialog } from '../../@oss/components/common/dependency'
import { Fields, Loading } from '../../@oss/components/common/builder'
import { Form } from '../../@oss/components/common/form'
import { InitializrContext } from '../../@oss/components/reducer/Initializr'
import { getConfig, getInfo, getProject } from '../../@oss/components/utils/ApiUtils'

const Explore = lazy(() => import('../../@oss/components/common/explore/Explore.js'))
const Share = lazy(() => import('../../@oss/components/common/share/Share.js'))
const HotKeys = lazy(() => import('../../@oss/components/common/builder/HotKeys.js'))

export default function Application() {
    const {
        complete,
        dispatch,
        theme,
        share: shareOpen,
        explore: exploreOpen,
        dependencies,
    } = useContext(AppContext)
    const { values, share, dispatch: dispatchInitializr } = useContext(
        InitializrContext
    )

    const [blob, setBlob] = useState(null)
    const [generating, setGenerating] = useState(false)

    const buttonExplore = useRef(null)
    const buttonDependency = useRef(null)
    const buttonSubmit = useRef(null)

    const windowsUtils = useWindowsUtils()
    useHash()

    useEffect(() => {
        if (windowsUtils.origin) {
            const url = `${windowsUtils.origin}/metadata/client`
            getInfo(url).then(jsonConfig => {
                const response = getConfig(jsonConfig)
                dispatchInitializr({ type: 'COMPLETE', payload: { ...response } })
                dispatch({ type: 'COMPLETE', payload: response })
            })
        }
    }, [dispatch, dispatchInitializr, windowsUtils.origin])

    const onSubmit = async () => {
        if (generating) {
            return
        }
        setGenerating(true)
        const url = `${windowsUtils.origin}/starter.zip`
        const project = await getProject(
            url,
            values,
            get(dependencies, 'list')
        ).catch(() => {
            toast.error(`Could not connect to server. Please check your network.`)
        })
        setGenerating(false)
        if (project.type == "text/plain") {
            project.text().then(text => toast.info(text))
        } else {
            FileSaver.saveAs(project, `${get(values, 'meta.artifact')}.zip`)
        }
    }

    const onExplore = async () => {
        const url = `${windowsUtils.origin}/starter.zip`
        dispatch({ type: 'UPDATE', payload: { explore: true } })
        const project = await getProject(
            url,
            values,
            get(dependencies, 'list')
        ).catch(() => {
            toast.error(`Could not connect to server. Please check your network.`)
        })
        setBlob(project)
    }

    const onShare = () => {
        dispatch({ type: 'UPDATE', payload: { share: true } })
    }

    const onEscape = () => {
        setBlob(null)
        dispatch({
            type: 'UPDATE',
            payload: { list: false, share: false, explore: false, nav: false },
        })
    }

    return (
        <>
            <BodyClassName className={theme} />
            <Suspense fallback=''>
                <HotKeys
                    onSubmit={() => {
                        if (get(buttonSubmit, 'current')) {
                            buttonSubmit.current.click()
                        }
                    }}
                    onExplore={() => {
                        if (get(buttonExplore, 'current')) {
                            buttonExplore.current.click()
                        }
                    }}
                    onDependency={event => {
                        if (get(buttonDependency, 'current')) {
                            buttonDependency.current.click()
                        }
                        event.preventDefault()
                    }}
                    onEscape={onEscape}
                />
            </Suspense>
            {/*<SideLeft />*/}
            <div id='main'>
                <div className='not-mobile'>
                    <h1 className='logo'>
                        <a href='/'>
                            <div className='logo-content' tabIndex='-1'>
                                <img src="./images/icon-48x48.png"></img>
                                <span class="spring">Spring</span>
                                <span class="postfix">Initializr for EDUK8S</span>
                            </div>
                        </a>
                    </h1>
                </div>
                <hr className='divider' />
                <Form onSubmit={onSubmit}>
                    {!complete ? (
                        <Loading />
                    ) : (
                        <>
                            <Fields
                                onSubmit={onSubmit}
                                refSubmit={buttonSubmit}
                                refDependency={buttonDependency}
                                generating={generating}
                            />
                            <DependencyDialog onClose={onEscape} />
                        </>
                    )}
                </Form>
            </div>
            {/*<SideRight />*/}
            <Suspense fallback=''>
                <Share open={shareOpen || false} shareUrl={share} onClose={onEscape} />
                <Explore
                    projectName={`${get(values, 'meta.artifact')}.zip`}
                    blob={blob}
                    open={exploreOpen || false}
                    onClose={onEscape}
                />
            </Suspense>
        </>
    )
}
