import pytest
import unittest

from modules.sfp_hostio import sfp_hostio
from sflib import OsintFootprints
from osintfootprints import OsintFootprintsEvent, OsintFootprintsTarget


@pytest.mark.usefixtures
class TestModuleHostio(unittest.TestCase):

    def test_opts(self):
        module = sfp_hostio()
        self.assertEqual(len(module.opts), len(module.optdescs))

    def test_setup(self):
        sf = OsintFootprints(self.default_options)
        module = sfp_hostio()
        module.setup(sf, dict())

    def test_watchedEvents_should_return_list(self):
        module = sfp_hostio()
        self.assertIsInstance(module.watchedEvents(), list)

    def test_producedEvents_should_return_list(self):
        module = sfp_hostio()
        self.assertIsInstance(module.producedEvents(), list)

    def test_handleEvent_no_api_key_should_set_errorState(self):
        sf = OsintFootprints(self.default_options)

        module = sfp_hostio()
        module.setup(sf, dict())

        target_value = 'example target value'
        target_type = 'INTERNET_NAME'
        target = OsintFootprintsTarget(target_value, target_type)
        module.setTarget(target)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = OsintFootprintsEvent(event_type, event_data, event_module, source_event)

        result = module.handleEvent(evt)

        self.assertIsNone(result)
        self.assertTrue(module.errorState)
