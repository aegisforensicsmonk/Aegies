import pytest
import unittest

from modules.sfp_comodo import sfp_comodo
from sflib import OsintFootprints
from osintfootprints import OsintFootprintsEvent, OsintFootprintsTarget


@pytest.mark.usefixtures
class TestModuleIntegrationcomodo(unittest.TestCase):

    def test_handleEvent_event_data_safe_internet_name_not_blocked_should_not_return_event(self):
        sf = OsintFootprints(self.default_options)

        module = sfp_comodo()
        module.setup(sf, dict())

        target_value = 'osintfootprints.net'
        target_type = 'INTERNET_NAME'
        target = OsintFootprintsTarget(target_value, target_type)
        module.setTarget(target)

        def new_notifyListeners(self, event):
            raise Exception(f"Raised event {event.eventType}: {event.data}")

        module.notifyListeners = new_notifyListeners.__get__(module, sfp_comodo)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = OsintFootprintsEvent(event_type, event_data, event_module, source_event)

        event_type = 'INTERNET_NAME'
        event_data = 'comodo.com'
        event_module = 'example module'
        source_event = evt

        evt = OsintFootprintsEvent(event_type, event_data, event_module, source_event)
        result = module.handleEvent(evt)

        self.assertIsNone(result)
