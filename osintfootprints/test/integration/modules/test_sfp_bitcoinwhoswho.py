import pytest
import unittest

from modules.sfp_bitcoinwhoswho import sfp_bitcoinwhoswho
from sflib import OsintFootprints
from osintfootprints import OsintFootprintsEvent, OsintFootprintsTarget


@pytest.mark.usefixtures
class TestModuleIntegrationBitcoinwhoswho(unittest.TestCase):

    @unittest.skip("todo")
    def test_handleEvent(self):
        sf = OsintFootprints(self.default_options)

        module = sfp_bitcoinwhoswho()
        module.setup(sf, dict())

        target_value = 'example target value'
        target_type = 'IP_ADDRESS'
        target = OsintFootprintsTarget(target_value, target_type)
        module.setTarget(target)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = OsintFootprintsEvent(event_type, event_data, event_module, source_event)

        result = module.handleEvent(evt)

        self.assertIsNone(result)
